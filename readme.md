# s3print

Print the contents of a file on S3 to stdout

## Install
```sh
$ npm install -g @mapbox/s3print
```

## Configuration

Provide S3 credentials through any means [supported by the AWS JS SDK](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html). If the file is publicly accessible, you do not need to provide any credentials. If you use the `--prefix` option you'll need permission to `ListBucket` in the appropriate bucket.

## Usage
```sh
$ s3print s3://s3print-test/test-file
# Prints "Hello world!"

$ s3print --prefix s3://s3print-test/
# Lists object under the given prefix and prints them all
```

## Alternative

A similar functionality is delivered by the [aws-cli](https://github.com/aws/aws-cli) as follows:

```sh
$ aws s3 cp s3://s3print-test/test-file -
# Prints "Hello world!"
```
