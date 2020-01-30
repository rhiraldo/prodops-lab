# ProdOps Labs

----
## Tooling Needed
1. A Kubernetes cluster [Minikube is just fine](https://kubernetes.io/docs/setup/learning-environment/minikube/)
2. A MySQL box or container with a database and user with permissions to the DB.
3. [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
4. [helm 2](https://github.com/helm/helm/releases/tag/v2.16.1)
5. [git](https://git-scm.com/downloads)



> It's a good practice to have this tools on your computer as you will need them for ProdOps work.

----
## Objectives
1. Get familiar with the prodops-lab code.
2. Containerize the app.
3. Build docker image and push to Artifactory.
4. Create helm charts for prodops-lab.
5. Deploy the application Kubernetes.
6. *Application needs to be live and running.*
7. Troubleshooting and Debugging.





----
## Tips
### Building Dockerfile
    FROM node:alpine3.10
    # Create app directory
    WORKDIR /usr/src/app

    # Install app dependencies
    # A wildcard is used to ensure both package.json AND 
    package-lock.json are copied
    # where available (npm@5+)
    COPY package*.json ./

    # Install required NPM components.
    RUN npm install

    # Bundle app source
    COPY src/app/* /usr/src/app/

    # This will expose port 8080 for the app.
    EXPOSE 8080
    CMD [ "node", "main.js" ]

### Docker image build
    cd prodops-lab
    sudo docker build -t rhiraldo/prodops-lab .

### Image tag and push
    sudo docker tag  rhiraldo/prodops-lab rhiraldo/prodops-lab:v2.3.5
    sudo docker push rhiraldo/prodops-lab:v2.3.5


### Creating a Helm chart
    mkdir charts && cd charts
    helm create prodops-lab

### Deploying Helm/Tiller to Kubernetes
    kubectl -n kube-system create serviceaccount tiller

    kubectl create clusterrolebinding tiller \
      --clusterrole=cluster-admin \
      --serviceaccount=kube-system:tiller

    helm init --service-account tiller

### Creating a secret in Kubernetes
    kubectl create secret generic prodops-lab-secret --from-literal=DB_PASSWORD=prodops

### Deploying prodops-lab to K8s with Helm
    # Deploying with values from values.yaml
    helm install --name prodops-lab ./prodops-lab/

    # Deploying with values from overrides.yaml
    helm install --name prodops-lab ./prodops-lab/ --namespace default -f ./prodops-lab/overrides.yaml

----
## Troubleshooting
* CrashLoopBackoff


>Run *kubectl logs <podname> -p* the -p option will read the logs of the previous (crashed) instance.

> Run *kubectl describe pod <podname>* to see events.

* ImagePullBackoff

> Check if your image name, tag and repo exist. If the repo does not allow anonymous access, do you have a ImagePullSecret specified?

----
## changelog
* 29-Jan-2020 - Update README