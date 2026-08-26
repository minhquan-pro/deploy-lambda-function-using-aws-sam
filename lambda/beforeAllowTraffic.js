"use strict";

const AWS = require("aws-sdk");
const codedeploy = new AWS.CodeDeploy({ apiVersion: "2014-10-06" });
var lambda = new AWS.Lambda();

exports.handler = (event, context, callback) => {
  console.log("Entering PreTraffic Hook!");

  var deploymentId = event.DeploymentId;
  var lifecycleEventHookExecutionId = event.LifecycleEventHookExecutionId;

  var functionToTest = process.env.NewVersion;
  console.log("BeforeAllowTraffic hook tests started");
  console.log("Testing new function version: " + functionToTest);

  var lambdaParams = {
    FunctionName: functionToTest,
    Payload: '{"option": "time"}',
    InvocationType: "RequestResponse",
  };

  var lambdaResult = "Failed";
  lambda.invoke(lambdaParams, function (err, data) {
    if (err) {
      // an error occurred
      console.log(err, err.stack);
      lambdaResult = "Failed";
    } else {
      // successful response
      var result = JSON.parse(data.Payload);
      console.log("Result: " + JSON.stringify(result));
      console.log("statusCode: " + result.statusCode);

      if (result.statusCode != "400") {
        console.log("Validation succeeded");
        lambdaResult = "Succeeded";
      } else {
        console.log("Validation failed");
      }

      var params = {
        deploymentId: deploymentId,
        lifecycleEventHookExecutionId: lifecycleEventHookExecutionId,
        status: lambdaResult, // status can be 'Succeeded' or 'Failed'
      };

      codedeploy.putLifecycleEventHookExecutionStatus(
        params,
        function (err, data) {
          if (err) {
            // Validation failed.
            console.log("CodeDeploy Status update failed");
            console.log(err, err.stack);
            callback("CodeDeploy Status update failed");
          } else {
            // Validation succeeded.
            console.log("CodeDeploy status updated successfully");
            callback(null, "CodeDeploy status updated successfully");
          }
        },
      );
    }
  });
};
