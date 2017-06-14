#!/usr/bin/env node
import * as Path from "path";
import {cat, mkdir, pwd, test} from "shelljs";
import {getTag} from "./get-tag";
import {downloadPackage} from "./download-package";
import {checkoutVersion} from "./checkoutVersion";

let os = require('osenv');

let each = function (object: any, fn: Function) {
  for (let prop in object) {
    fn(object[prop], prop);
  }
};

let PKG_CONFIG_FILENAME = 'package.json';
let PKG_CONFIG_ENTRY = 'gitDependencies';
let DEST_DIR = Path.resolve('' + pwd(), 'git-dependencies');

if (!test('-d', DEST_DIR)) {
  mkdir(DEST_DIR);
}

export function gitInstall(config: any) {
  let packages: number = 0;
  let time = Date.now();
  each(config[PKG_CONFIG_ENTRY], function (_: string, host: string) {
    each(config[PKG_CONFIG_ENTRY][host], function (versionRange: string, fullPackageName: string) {
      let tokens = fullPackageName.split('/');
      let domain = tokens[0];
      let pkgName = tokens[1];
      let tag: string = getTag(host, domain, pkgName, versionRange);
      let pkgLog = '[' + fullPackageName + '@' + tag + ']';

      if (!tag) {
        console.error('[' + fullPackageName + '@' + versionRange + ']' + ' does not match any versions');
        return;
      }

      let pkgDest = Path.resolve(DEST_DIR, pkgName);

      if (!test('-d', pkgDest)) {
        console.info('Downloading ' + fullPackageName + '...');
        if (!downloadPackage(host, domain, pkgName, pkgDest)) {
          console.error('Error while downloading ' + fullPackageName);
          return;
        }
      }

      if (!checkoutVersion(tag, pkgDest, pkgLog)) {
        console.warn('Failed to checkout tag ' + tag + ' of ' + fullPackageName);
        return;
      }
      packages++;
    });
  });

  console.info('Updated %s packages in %ss', packages, (Date.now() - time) / 1000);
}

let config = JSON.parse(cat(PKG_CONFIG_FILENAME));
gitInstall(config);
