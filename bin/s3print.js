#!/usr/bin/env node

var AWS = require('aws-sdk');
var url = require('url');
var _ = require('lodash');

function usage(code) {
  console.log('s3print <s3 uri> [--prefix]\n');
  console.log('For example:');
  console.log('  s3print s3://my-bucket/path/to/some/file.txt');
  console.log('  s3print  --prefix s3://my-bucket/some/prefix');
  process.exit(code);
}

var args = require('minimist')(process.argv.slice(2));
if (!args._[0] && !args.prefix) usage(1);
if (!args._[0] && args.prefix) args._[0] = args.prefix;
if (args.help) usage(0);

var uri = url.parse(args._[0]);
var s3 = new AWS.S3();

s3.config.getCredentials(function(err) {
  if (err && err.message !== 'Could not load credentials from any providers') throw err;
  var get = err ?
    _.partial(s3.makeUnauthenticatedRequest.bind(s3), 'getObject') :
    s3.getObject.bind(s3);
  var list = err ?
    _.partial(s3.makeUnauthenticatedRequest.bind(s3), 'listObjects') :
    s3.listObjects.bind(s3);

  if (!args.prefix) {
    return get({
      Bucket: uri.hostname,
      Key: uri.pathname.slice(1)
    }).createReadStream().on('error', function(err) {
      console.error(err);
      process.exit(1);
    }).on('end', function() {
      process.stdout.write('\n');
    }).pipe(process.stdout);
  }

  ls();

  function ls(marker) {
    var params = {
      Bucket: uri.hostname,
      Prefix: uri.pathname.slice(1)
    };
    if (marker) params.Marker = marker;
    list(params, function(err, data) {
      if (err) {
        console.error(err);
        process.exit(1);
      }

      var last = data.Contents.slice(-1)[0];

      getSome(data.Contents, function(err) {
        if (err) {
          console.error(err);
          process.exit(1);
        }

        if (data.IsTruncated && last) return ls(last.Key);
        process.exit(0);
      });
    });
  }

  function getSome(objects, callback) {
    var object = objects.shift();
    if (!object) return callback();
    get({
      Bucket: uri.hostname,
      Key: object.Key
    }).createReadStream()
      .once('error', callback)
      .on('end', function() {
        process.stdout.write('\n');
        getSome(objects, callback);
      })
      .pipe(process.stdout);
  }
});
