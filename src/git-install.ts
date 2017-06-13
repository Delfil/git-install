#!/usr/bin/env node
'use strict';
import * as Path from "path";
import {clean} from "semver";
import {cat, cd, mkdir, pwd, rm, test} from "shelljs";
import {getTag} from "./get-tag";
import {downloadPackage} from "./download-package";
import {copyCachedPackage} from "./copy-cached-package";

let os = require('osenv');

let each = function (object: any, fn: Function) {
  for (let prop in object) {
    fn(object[prop], prop);
  }
};

let PKG_CONFIG_FILENAME = 'package.json';
let PKG_CONFIG_ENTRY = 'gitDependencies';
let CACHE_DIR = Path.resolve(os.home(), '.git-install');
let DEST_DIR = Path.resolve('' + pwd(), 'git-dependencies');

if (!test('-d', CACHE_DIR)) {
  mkdir(CACHE_DIR);
}
if (test('-d', DEST_DIR)) {
  rm('-r', DEST_DIR);
}
mkdir(DEST_DIR);

export function gitInstall(config: any, indent: string = '') {
  each(config[PKG_CONFIG_ENTRY], function (_: string, host: string) {
    each(config[PKG_CONFIG_ENTRY][host], function (versionRange: string, index: string) {
      let tokens = index.split('/');
      let domain = tokens[0];
      let pkgName = tokens[1];
      let tag = getTag(host, domain, pkgName, versionRange);
      let pkgLog = indent + domain + '/' + pkgName + '@' + versionRange + ': ';

      if (!tag) {
        console.error(pkgLog + 'err: no version found');
        return;
      }

      let version = clean(tag);
      console.log(pkgLog + version);

      let cacheDest = Path.resolve(CACHE_DIR, pkgName, version);
      let pkgDest = Path.resolve(DEST_DIR, pkgName);
      let childConfigFile = Path.resolve(cacheDest, PKG_CONFIG_FILENAME);
      let config = null;

      cd(CACHE_DIR);

      if (!test('-d', cacheDest)) {
        if (!downloadPackage(host, domain, pkgName, tag, cacheDest)) {
          console.error('err: downloading pkgName');
          return;
        }
      }

      copyCachedPackage(pkgName, version, cacheDest, pkgDest);

      if (test('-f', childConfigFile)) {
        config = JSON.parse(cat(childConfigFile));
        if (config) {
          gitInstall(config, indent + '  ');
        }
      }
    });
  });
};

let config = JSON.parse(cat(PKG_CONFIG_FILENAME));
gitInstall(config);
