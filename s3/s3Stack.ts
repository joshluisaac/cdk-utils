import { App, Stack, StackProps } from '@aws-cdk/core';
import {Bucket} from '@aws-cdk/aws-s3';


export class s3Stack extends Stack {

    constructor(scope:App, environmentId:string, props?: StackProps) {
        super(scope,`SampleProjectS3Stack-${environmentId}`,props);
        const bucket = new Bucket(this, "SampleBucket", {bucketName:"avant-systems-test-bucket"});
    }

}