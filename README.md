# Azure Devops pullrequest comment

Simple cli-tool with no dependencies to quickly post comments to azure-pipelines from azure-pipelines.

# Environment variables
The required configuration with the exception of accesstoken is already set by default in azure pipelines.

```javascript
org_url = process.env.SYSTEM_COLLECTIONURI
project = process.env.SYSTEM_TEAMPROJECT
repository = process.env.BUILD_REPOSITORY_NAME
pr = process.env.SYSTEM_PULLREQUEST_PULLREQUESTID
token = process.env.AZURE_DEVOPS_PERSONAL_ACCESS_TOKEN
```

# Usage in azure-pipelines

```yaml
steps:
- bash: |
    cat 
    echo "my comment from ci" | npx vsts-pr-comment
  env:
    SYSTEM_ACCESSTOKEN: $(System.AccessToken)
```


# Endpoints used
- https://learn.microsoft.com/en-us/rest/api/azure/devops/git/pull-request-threads?view=azure-devops-rest-7.0
- https://learn.microsoft.com/en-us/rest/api/azure/devops/git/pull-request-thread-comments?view=azure-devops-rest-7.0