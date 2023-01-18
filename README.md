# Devops Course Management Project
 
This project is a course management system.

There is 2 microservices in this project.
The first microservice is a course service in which we can see the list of all courses, delete courses and add courses.

The second microservice is a teacher service in wich we can see the list of all teachers, add teachers and delete teachers. We can also see the list of courses for a particular teacher, or add a course or also delete a course.

These two microservices connects with an external database Atlas MongoDB

![image](https://user-images.githubusercontent.com/56639521/213157263-4706430f-19eb-4dcd-a726-74a9586b42ed.png)


# Deployment

## Architecture
![Architecture](https://user-images.githubusercontent.com/56639521/213175270-1b90f171-709c-4ef8-ae49-df353cdb88d9.png)

So I started by dockerizing my two services then I Created Yaml files to deploy it in kubernetes.
![image](https://user-images.githubusercontent.com/56639521/213176341-0bf6351e-63ba-49ed-aa18-b66bd9911472.png)

![image](https://user-images.githubusercontent.com/56639521/213178267-a8647591-8165-41ea-8e12-8d26a8810a22.png)

##Deployment Strategy
I will use Canary because:
- version released for a subset of users
- convenient for error rate and performance monitoring
- fast rollback

# Observability
## Metrics 
For the metrics I worked with Prometheus for that i used prom-client. And I installed Prometheus in my cluster using helm chart.
![image](https://user-images.githubusercontent.com/56639521/213179389-eb950664-1b16-4d6c-b459-ee630d1b290b.png)

My metrics are counters. 
- We have all_requests:
- ![image](https://user-images.githubusercontent.com/56639521/213179713-f27e3121-0d33-4e8a-bb93-dcad1a2b0814.png)
- For the buisiness metric we can use all_requests with a filter in the http POST.
- ![image](https://user-images.githubusercontent.com/56639521/213180234-bcaef81d-9218-4a48-b8df-10c7cf758821.png)

For better Visualization, I used grafana and I installed it in my cluster using the helm chart:
![image](https://user-images.githubusercontent.com/56639521/213180540-af7483b3-5851-439a-8afd-767d57d7e625.png)
![image](https://user-images.githubusercontent.com/56639521/213180865-d357a5a6-1b05-4374-81a0-54a14bc3b9e9.png)

## Logging
For Logging I used winston Logger and i configure it in my services then I installed the datadog agent in my cluster so that I can see the logs in Datadog.
![image](https://user-images.githubusercontent.com/56639521/213181423-3bb931bc-fe1f-4288-b25d-b45f46cc80c1.png)

![image](https://user-images.githubusercontent.com/56639521/213181823-e94d3085-72de-4a9c-ac33-b22a774a709c.png)
![image](https://user-images.githubusercontent.com/56639521/213181908-cd637f34-80c1-44fc-a65c-f16b63f48f0e.png)

As we see, we have request ID of the log so that we can filter the logs by ID.

Also  we have a rate limit user requests based on their IP address. For that I used express rate limit package.




# Automation

I used Terraform to automate various infrastructure tasks.
So I created three stacks and I used a backend state(Azure Storage Account).

## Aks Cluster Provisionning
I created a new ressource group and an  aks cluster. 

## Infrastructure layer
In this layer I automated the deployment of my application using helm charts and I also set up the ingress in my cluster.

## Observability layer
In this layer I set up the monitoring using helm chart. 
We have set up prometheus, grafana and datadog.











