[![REUSE status](https://api.reuse.software/badge/github.com/SAP-samples/btp-integration-toolkit-lite)](https://api.reuse.software/info/github.com/SAP-samples/btp-integration-toolkit-lite)

# Welcome to ITK Lite 4 Procurement
Welcome to sample use case of ITK Lite 4 Procurement BTP Application. This application developed on the CAPM (Cloud Application Programming Model) is a possible alterative to current ITK running as command line utility to transfer Master, Transactional and Spend Data between your SAP Ariba system and your back-end ERP environment.   

## Requirements
Please see the pre-requisites and the required BTP services in SAP Discovery Center mission - [Integrate ERP with SAP Ariba Procurement Solution using ITK Lite Application](https://discovery-center.cloud.sap/missiondetail/4260/4518/) and activate before cloning/forking the GIT Repository.

## Description
As SAP announced EOS(End of Support & Service) for current ITK(Integration Toolkit) tool from December 31, 2023. The ITK Lite powered by BTP solution allows buying organizations to integrate their Non SAP-ERP systems through SFTP channel with an SAP Ariba cloud solution to exchange master, transactional and spend viz data via CSV file upload and download. 

Sample View of ITK Lite Admin Application

![Reference Image](/ITKLite.jpg)

## Database Requirement
Use the main GIT branch if you are using PostgreSQL as your database in BTP. If the database is Hana DB , look at the example folder to convert the database HDB and also update MTA.YAML to deploy Multi Target Application with Hana Database.

## Deploy the Application
Simply run the following command to deploy the deployable file to your BTP Cloud Foundry environment.

```
npm run mta:package:deploy
```

## Known Issues
No known Issues

## How to obtain support
[Create an issue](https://github.com/SAP-samples/btp-integration-toolkit-lite/issues) in this repository if you find a bug or have questions about the content.
 
For additional support, [ask a question in SAP Community](https://answers.sap.com/questions/ask.html).

## Contributing
If you wish to contribute code, offer fixes or improvements, please send a pull request. Due to legal reasons, contributors will be asked to accept a DCO when they create the first pull request to this project. This happens in an automated fashion during the submission process. SAP uses [the standard DCO text of the Linux Foundation](https://developercertificate.org/).

## License
Copyright (c) 2023 SAP SE or an SAP affiliate company. All rights reserved. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](LICENSE) file.
