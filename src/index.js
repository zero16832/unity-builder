import {
  Action,
  BuildParameters,
  Cache,
  Docker,
  ImageTag,
  Kubernetes,
  Output,
  GoogleKubernetesEngine,
} from './model';

const core = require('@actions/core');

async function action() {
  Action.checkCompatibility();
  Cache.verify();

  const { dockerfile, workspace, actionFolder } = Action;

  const buildParameters = await BuildParameters.create();
  const baseImage = new ImageTag(buildParameters);

  // If google cloud credentials are specified, do whatever is needed to get a kubernetes cluster ready to handle a build job
  if (buildParameters.googleCloudProjectId) {
    core.info('Setting up Kubernetes with google cloud');
    await GoogleKubernetesEngine.makeClusterAvailableForBuilds();
  }

  if (buildParameters.kubeConfig) {
    core.info('Building with Kubernetes');
    await Kubernetes.runBuildJob(buildParameters, baseImage);
  } else {
    // Build docker image
    // TODO: No image required (instead use a version published to dockerhub for the action, supply credentials for github cloning)
    const builtImage = await Docker.build({
      path: actionFolder,
      dockerfile,
      baseImage,
      uid: buildParameters.uid,
      gid: buildParameters.gid,
    });
    await Docker.run(builtImage, { workspace, ...buildParameters });
  }

  // Set output
  await Output.setBuildVersion(buildParameters.buildVersion);
}

action().catch((error) => {
  core.setFailed(error.message);
});
