# Function that reads data  using the OCI Node.js for Oracle NoSQL Database

This function uses Resource Principals to securely authorize a function to make
API calls to  Oracle NoSQL Database. You can query tables in a compartment 



As you make your way through this tutorial, look out for this icon ![user input icon](./images/userinput.png).
Whenever you see it, it's time for you to perform an action.


## Prerequisites

1. Before you deploy this sample function, make sure you have run steps A, B 
and C of the [Oracle Functions Quick Start Guide for Cloud Shell](https://www.oracle.com/webfolder/technetwork/tutorials/infographics/oci_functions_cloudshell_quickview/functions_quickview_top/functions_quickview/index.html)
    * A - Set up your tenancy
    * B - Create application
    * C - Set up your Cloud Shell dev environment


## List Applications 

Assuming you have successfully completed the prerequisites, you should see your 
application in the list of applications.

```
fn ls apps
```


## Create or Update your Dynamic Group

In order to use other OCI Services, your function must be part of a dynamic 
group. For information on how to create a dynamic group, refer to the 
[documentation](https://docs.cloud.oracle.com/iaas/Content/Identity/Tasks/managingdynamicgroups.htm#To).

![user input icon](./images/userinput.png)


When specifying the *Matching Rules*, we suggest matching all functions in a compartment with:

```
ALL {resource.type = 'fnfunc', resource.compartment.id = 'ocid1.compartment.oc1..aaaaaxxxxx'}
```


## Create or Update IAM Policies

Create a new policy that allows the dynamic group to `manage objects` in the functions related compartment.

![user input icon](./images/userinput.png)

Your policy should look something like this:
```
Allow dynamic-group <dynamic-group-name> to manage objects in compartment <compartment-name>
```
e.g.
```
Allow dynamic-group demo-func-dyn-group to manage nosql-family in compartment demo-func-compartment
```
For more information on how to create policies, go [here](https://docs.cloud.oracle.com/iaas/Content/Identity/Concepts/policysyntax.htm).


## Review and customize the function

Review the following files in the current folder:

- [package.json](./package.json) specifies all the dependencies for your function
- [func.yaml](./func.yaml) that contains metadata about your function and declares properties
- [func.py](./func.py) which is your actual Python function

## Deploy the function

In Cloud Shell, run the `fn deploy` command to build the function and its dependencies as a Docker image, 
push the image to the specified Docker registry, and deploy the function to Oracle Functions 
in the application created earlier:

![user input icon](./images/userinput.png)

```
COMP_ID="<your_cmpid>"
fn config app  <app-name> NOSQL_COMPARTMENT_ID $COMP_ID
fn config app  <app-name> NOSQL_REGION $OCI_REGION
```

e.g.
```
COMP_ID="ocid1.compartment.oc1..aaaaaxxxxx"
fn config app  myapp NOSQL_COMPARTMENT_ID $COMP_ID
fn config app  myapp NOSQL_REGION $OCI_REGION
```



```
fn -v deploy --app <app-name>
```
e.g.
```
fn -v deploy --app myapp
```


## Create Nosql Tables

![user input icon](./images/userinput.png)


````
COMP_ID="<your_cmpid>"

DDL_TABLE="CREATE TABLE IF NOT EXISTS Tutorial (id LONG GENERATED ALWAYS as IDENTITY (NO CYCLE), kv_json_ JSON, PRIMARY KEY( id ))"
echo $DDL_TABLE

oci nosql table create --compartment-id "$COMP_ID"   \
--name Tutorial --ddl-statement "$DDL_TABLE" \
--table-limits="{\"maxReadUnits\": 50,  \"maxStorageInGBs\": 25,  \"maxWriteUnits\": 50 }" \
--wait-for-state SUCCEEDED --wait-for-state FAILED

oci nosql row update  --compartment-id "$COMP_ID" --table-name-or-id Tutorial \
--value '{"kv_json_": { "author": { "name": "Dario VEGA"},  "title": "Oracle Functions Samples with NOSQL DB"}}'
````

## Test

![user input icon](./images/userinput.png)
```
echo -n <JSON-object> | fn invoke <app-name> <function-name>
```
e.g.
```
echo '{"tableName":"Tutorial"}' | fn invoke myapp hello-nosql | jq

[
  {
    "id": 1,
    "kv_json_": {
      "author": {
        "name": "Dario VEGA"
      },
      "title": "Oracle Functions Samples with NOSQL DB"
    }
  }
]
```
You should see a success message appear in the terminal.

## Clean Up

```
oci nosql table delete  --compartment-id "$COMP_ID"  --table-name-or-id Tutorial  
```


