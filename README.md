# AWS Infrastructure 🏭👥

AWS meta infrastructure management via CDK

## 🌟 Key Concepts

* Publish infrastructure by bumping the version or tagging a commit `deploy-*`; see [`.github/workflows/cdk-deploy.yml`](.github/workflows/cdk-deploy.yml)
* [`lib/cdk-stack.ts`](lib/cdk-stack.ts) defines the stack resources. Most code is written in the stack.
* [`bin/cdk.js`](bin/cdk.js) is the entrypoint for the CDK application, passing configuration to the stack. The entrypoint is modified less frequently than the stack.
* This repository should focus on infrastructure management and not application code
* Applications should be managed in separate repositories, see "Additional Repositories" below and [https://github.com/finlaysonstudio/initzero-template-project](https://github.com/finlaysonstudio/initzero-template-project)

## 📋 Stack Overview

* AWS CDK
    * CloudFormation to bootstrap GitHub OIDC
    * CDK for infrastructure deployment
* GitHub
    * Actions for CI/CD
    * Variables and secrets for configuration management

## 🔒 Security Considerations

This template will allow any GitHub repository in the organization or personal account to deploy infrastructure to the AWS account.
These security implications are not suitable for production.
Restricting access to GitHub is sufficient for non-production cases.
Mitigating these concerns by creating repository-specific roles and linking them to the OIDC provider is outside the scope of this template.

This template assumes a single-account setup.
Multi-account setups can be managed by bootstrapping each account and triggering different CDK stacks for each account.
A multi-account organization with repo restrictions on the production account would be a first step toward an enterprise-grade infrastructure.
Multi-account setups are outside the scope of this template.

## 💿 Infrastructure Deployment

### Pre-requisites

* An AWS account with sufficient permissions, the cleaner the better
    * Organizations allow existing account to create new sub-accounts with consolidated billing
* GitHub account or organization for CI/CD and configuration management

### Getting Started

* Create a new GitHub using this repository as a template (or fork/copy this)
    * Suggested naming convention `SPONSOR-aws`, `SPONSOR-infrastructure`, or `SPONSOR-aws-infrastructure` for the truly undecided
    * `SPONSOR` is the GitHub username, GitHub organization, something else, or nothing at all
    * This will be referred to as the "infrastructure repository"
* Update the project header in this README and remove the TODO item
* Optionally edit/replace any/all README content (e.g., the Changelog)
* Change the package name in `package.json` to match the repository name
* Optionally start the package version at `1.0.0` or `0.1.0` instead of inheriting from the template
* Run `npm install` to install the dependencies
* Commit

### AWS Bootstrapping: OIDC and CDK

These steps (a) create a method for GitHub Actions to deploy infrastructure and (b) prepare the AWS account for CDK deployments.

* Switch to "N. Virginia" (us-east-1) region
    * Other regions will work with additional configuration outside the scope of this template
* Visit CloudFormation in the AWS Console
* Create a new stack with the `github-actions-oidc-provider.yml` template
* In Step 2,
    * Name the stack `iam-github-actions-oidc-provider` or anything else
    * Set `GithubOrgAccountParam` to the GitHub organization or account name
    * Optionally change the NonceParam to a random string
* You may need to acknowledge the stack will create IAM resources in step 3 or 4
* Once deployed, make note of the `GitHubDeployIamRoleArn` output value (e.g., `arn:aws:iam::123456789012:role/iam-github-actions-oidc-provide-GitHubDeployIamRole-g4rb4g3t3xt`) in the Outputs tab
* Open the CloudShell from the lower left or services menu
* Run:
    * `cdk bootstrap aws://$( aws sts get-caller-identity | jq -r '.Account' )/us-east-1`

### GitHub Configuration

For Individual Repositories:

* Visit the infrastructure repository in GitHub
* Go to Settings > Secrets and Variables > Actions
* In the Variables tab, add a new repository variable
    * Name: `ACCOUNT_AWS_ROLE_ARN`
    * Value: `GitHubDeployIamRoleArn` from the CloudFormation stack output

This will only configure the infrastructure repository to deploy to the AWS account.
Additional repositories can be configured separately.
Organizations can configure all repositories at once by visiting the organization in GitHub, navigating to Settings > Secrets and Variables > Actions, and adding the `ACCOUNT_AWS_ROLE_ARN` variable.

### Deployment

* Optionally set `CDK_ENV_HOSTED_ZONE_NAME` in the repository settings (as a variables under secrets and variables) or [`cdk-deploy.yml`](.github/workflows/cdk-deploy.yml)
* Publish infrastructure by bumping the version or tagging a commit `deploy-*`
* Optionally uncomment push to branches in [`cdk-deploy.yml`](.github/workflows/cdk-deploy.yml). This will trigger a deploy on any push to the `main` branch or any feature branches. This may cause unintended deployments.

## 👷 Infrastructure Management

### Testing

Testing infrastructure is hard.
Optional Jest tests are in [cdk.test.ts](./test/cdk.test.ts).
They are run as part of the GitHub Actions workflow.

Rather than writing tests for resources, deploy infrastructure without tests and only write tests for flow controls (i.e.g., conditionals that alter behavior based on environment variables from the CI/CD pipeline).

### New CDK Resources

New CDK resources are added to [`cdk-stack.ts`](lib/cdk-stack.ts).
Examples of new shared infrastructure may include new IAM roles (e.g., for more restrictive deploy permissions), shared logging buckets, account-wide monitoring, maintenance tasks, etc.

### Additional Repositories

Application-specific resources should be managed in separate repositories.
A compatible template repository is available for application-specific resources:

[https://github.com/finlaysonstudio/initzero-template-project](https://github.com/finlaysonstudio/initzero-template-project)

New repositories will need the value of `ACCOUNT_AWS_ROLE_ARN` from the infrastructure repository.
Individual accounts will need a new repository variable.
Organizations may use organization-wide variables or repository variables.
See "GitHub Configuration" above.

## 🔧 Troubleshooting

### GitHub Actions Cannot Assume Role

```
Run aws-actions/configure-aws-credentials@v4
Assuming role with OIDC
Assuming role with OIDC
Assuming role with OIDC
Assuming role with OIDC
Assuming role with OIDC
Assuming role with OIDC
Assuming role with OIDC
Assuming role with OIDC
Assuming role with OIDC
Assuming role with OIDC 
Assuming role with OIDC
Assuming role with OIDC
Error: Could not assume role with OIDC: Not authorized to perform sts:AssumeRoleWithWebIdentity
```

This should be visible in the AWS Cloudtrail logs:

* In the AWS Console, navigate to CloudTrail > Event History
* Set "Lookup attributes" filter to "Event name" and search for `AssumeRoleWithWebIdentity`
* Click on the event and look for the `errorMessage` in the JSON view. Usually it is `An unknown error occurred`
* Find the `roleArn` in the `requestParameters` section
* Copy the role name, the last part of the ARN after the `role/` (e.g., `iam-github-actions-oidc-provide-GitHubDeployIamRole-g4rb4g3t3xt`)
* In the AWS Console, navigate to IAM > Roles, search the role name, and open it
* Under "Permissions," there should be one permissions policy 
* Under "Trust relationships" tab, there should be one trust relationship
* Confirm the trust relationship JSON includes `sts:AssumeRoleWithWebIdentity` and the condition is set to `repo:my_org/*:*`

If the condition in the JSON does not match `repo:my_org/*:*`, re-run the stack and update `GithubOrgAccountParam` in step 2.
See "AWS Bootstrapping: OIDC and CDK" above.

## 📝 Changelog

| Date       | Version | Summary        |
| ---------- | ------- | -------------- |
| 12/10/2024 |   1.0.0 | Initial launch |
| 12/10/2024 |   0.1.0 | Initial deploy |
|  12/9/2024 |   0.0.1 | Initial commit |

## 📜 License

[MIT License](./LICENSE.txt). Published by Finlayson Studio
