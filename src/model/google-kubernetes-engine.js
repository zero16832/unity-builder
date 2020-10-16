import container from '@google-cloud/container';

class GoogleKubernetesEngine {
  static async makeClusterAvailableForBuilds() {
    // Create the Cluster Manager Client
    const client = new container.v1.ClusterManagerClient();

    const zone = 'us-central1-a';
    const projectId = await client.getProjectId();

    const request = {
      projectId,
      zone,
    };

    const [response] = await client.listClusters(request);

    console.log('Clusters:');
    console.log(response.clusters);

    // if name
    //   get credentials
    // else
    //   create cluster
    //   get credentials
  }
}
export default GoogleKubernetesEngine;
