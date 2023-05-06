[![REUSE status](https://api.reuse.software/badge/github.com/SAP-samples/btp-integration-toolkit-lite)](https://api.reuse.software/info/github.com/SAP-samples/btp-integration-toolkit-lite)

# Welcome to ITK Lite 4 Procurement
Welcome to the sample use case of the ITK Lite 4 Procurement BTP application. This application developed on the Cloud Application Programming Model (CAP) is a possible alternative to the current ITK running as command line utility to transfer master, transactional, and spend data between your SAP Ariba system and your back-end ERP environment.  

## Requirements
Please see the pre-requisites and the required BTP services in SAP Discovery Center mission - [Integrate ERP with SAP Ariba Procurement Solution using ITK Lite Application](https://discovery-center.cloud.sap/missiondetail/4260/4518/) before cloning/forking the GIT Repository.

## Description
SAP announced the end of support and service (EOS) for the current Integration Toolkit tool (ITK) as of December 31, 2023. The ITK Lite powered by BTP solution allows buying organizations to integrate their non-SAP-ERP systems through an SFTP channel with an SAP Ariba cloud solution to exchange master, transactional, and spend viz data via CSV file upload and download.

Sample View of ITK Lite Admin Application

![Reference Image](/ITKLite.jpg)

## Database Requirement
Use the main GIT branch if you are using PostgreSQL as your database in BTP. If the database is HANA DB, look at the example folder to convert the database HDB and also update MTA.YAML to deploy Multi Target Applications with HANA Database.

## Database Requirement
Use the main GIT branch if you are using PostgreSQL as your database in BTP. If the database is Hana DB , look at the example folder to convert the database HDB and also update MTA.YAML to deploy Multi Target Application with Hana Database.

## Deploy the Application
Prior to running the package and deploy.

Step1: Go to app directory and run `npm i` command.\
Step2: Run the same command `npm i` under root directory as well.\
Step3: Run the following command to build and deploy the file to the SAP BTP, Cloud Foundry environment.

```
npm run mta:package:deploy
```

## Known Issues
No known Issues

## How to Get Support
[Create an issue](https://github.com/SAP-samples/btp-integration-toolkit-lite/issues) in this repository if you find a bug or have questions about the content.
 
For additional support, [ask a question in SAP Community](https://answers.sap.com/questions/ask.html).

## Contributing
If you wish to contribute code, or offer fixes and improvements, please send a pull request. Due to legal reasons, contributors will be asked to accept a DCO when they create the first pull request to this project. This happens in an automated fashion during the submission process. SAP uses [the standard DCO text of the Linux Foundation](https://developercertificate.org/).

## License
Copyright (c) 2023 SAP SE or an SAP affiliate company. All rights reserved. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](LICENSE) file.
