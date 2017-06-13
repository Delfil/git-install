'use strict';
import {gt} from "semver";
import {cp, rm} from "shelljs";

let pkgVersion: any = {};

export function copyCachedPackage(pkgName: string, version: string, source: string, dest: string): void {
  if (!pkgVersion[pkgName] || gt(version, pkgVersion[pkgName])) {
    if (pkgVersion[pkgName]) {
      rm('-r', dest);
    }
    pkgVersion[pkgName] = version;
    cp('-r', source, dest);
  }
}
