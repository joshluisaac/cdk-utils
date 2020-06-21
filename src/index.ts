import aws = require('aws-sdk');
import cdk = require('@aws-cdk/core');
import {ElastiCacheStackRequirement} from "./elasticache/elastiCacheStackRequirement";
import {ElastiCacheStack} from "./elasticache/elastiCacheStack";
import parameters from "./parameters.json";
import { s3Stack } from './s3/s3Stack';

const requirement = new ElastiCacheStackRequirement();
requirement.setEnvironment(process.env.ENV);
requirement.checkEnvironmentIsPresent();
requirement.checkAllowedEnvironments();

let authToken: string = "";
let xMattersUrl: string = "";

(async () => {
    const environment:any = process.env.ENV;
    const ssm = new aws.SSM({
        region: 'ap-southeast-2'
    });
    //fetch Redis auth token from SSM
    const authTokenParam = (await ssm.getParameter({'Name': parameters.environments[environment].ssmKeyRedisAuthToken, WithDecryption: true}).promise()).Parameter;
    if (authTokenParam?.Value !== undefined) {
        authToken = authTokenParam.Value;
    }
    const xMattersUrlParam = (await ssm.getParameter({'Name': parameters.environments[environment].ssmKeyXMattersUrl, WithDecryption: true}).promise()).Parameter;
    if (xMattersUrlParam?.Value !== undefined) {
        xMattersUrl = xMattersUrlParam.Value;
    }
    const app = new cdk.App();
    const stackProps = {env: {
            region: "ap-southeast-2",
        }};
    new ElastiCacheStack(app, environment, authToken, xMattersUrl, stackProps);
    new s3Stack(app,environment,stackProps);
    app.synth();
})().catch(e => console.log(e));

