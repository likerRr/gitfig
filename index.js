'use strict';

const path = require('path');
const fs = require('fs');
const osHomedir = require('os-homedir');
const iniparser = require('iniparser');

const CONFIG_TYPE = {
	LOCAL: 0,
	GLOBAL: 2
};
const localConfig = path.resolve(process.cwd(), '.git/config');
const globalConfig = path.resolve(osHomedir(), '.gitconfig');

// helpers
const repoPathConfig = cPath => path.resolve(cPath, '.git/config');
const getConfigPathLocal = (sync = false) => readResolve(localConfig, sync);
const getConfigPathGlobal = (sync = false) => readResolve(globalConfig, sync);
const getConfigPathRepo = (cPath, sync = false) => readResolve(repoPathConfig(cPath), sync);

// main api
const gitFig = type => getConfig(type, false);

gitFig.sync = type => getConfig(type, true);
gitFig.CONFIG_TYPE = CONFIG_TYPE;

module.exports = gitFig;

function getConfig(type, sync = false) {
	const configPath = getConfigPath(type, sync);

	return parseIni(configPath, sync);
}

function parseIni(cPath, sync = false) {
	if (!cPath) {
		return {};
	}

	if (sync) {
		return iniparser.parseSync(cPath) || {};
	}

	// supports path as just value either as a promise
	return new Promise((resolve, reject) => {
		Promise.resolve(cPath)
			.then(rPath => iniparser.parse(rPath, (err, data) => {
				/* eslint-disable no-unused-expressions */
				err ? reject(err) : resolve(data);
			}))
			.catch(err => reject(err));
	});
}

function getConfigPath(type, sync = false) {
	if (arguments.length === 1 && typeof type === 'boolean') {
		sync = type;
		type = undefined;
	}

	if (typeof type === 'string') {
		return getConfigPathRepo(type, sync);
	}

	if (type === CONFIG_TYPE.LOCAL) {
		return getConfigPathLocal(sync);
	}

	if (type === CONFIG_TYPE.GLOBAL) {
		return getConfigPathGlobal(sync);
	}

	return getConfigPathCascade(sync);
}

/**
 * Resolves local path if possible, then global path if possible and then custom path
 * @param sync
 * @return {Promise<string>|string}
 */
function getConfigPathCascade(sync = false) {
	if (sync) {
		try {
			return getConfigPathLocal(sync); // catches in case of fail
		} catch (err) {
			return getConfigPathGlobal(sync); // throws in case of fail
		}
	}

	return getConfigPathLocal(sync)
		.then(resPath => resPath, () => getConfigPathGlobal(sync));
}

function readResolve(fName, sync = false) {
	if (sync) {
		tryRead(fName, sync);

		return fName;
	}

	return tryRead(fName, sync).then(() => fName);
}

function tryRead(fName, sync = false) {
	if (sync) {
		return fs.accessSync(fName, fs.constants.R_OK);
	}

	return new Promise((resolve, reject) => fs.access(fName, fs.constants.R_OK, err => err ? reject(err) : resolve()));
}
