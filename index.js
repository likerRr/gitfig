'use strict';

const path = require('path');
const fs = require('fs');
const osHomedir = require('os-homedir');
const iniparser = require('iniparser');

const CONFIG_TYPE = {
	LOCAL: 0,
	HOME: 2
};

// helpers
const repoPathConfig = cPath => path.resolve(cPath, '.git/config');
const homePathConfig = cPath => path.resolve(cPath, '.gitconfig');
const localConfig = repoPathConfig(process.cwd()); // current working directory
const homeConfig = homePathConfig(osHomedir()); // current user's home path
const getConfigPathLocal = (sync = false) => readResolve(localConfig, sync);
const getConfigPathHome = (sync = false) => readResolve(homeConfig, sync);
const getConfigPathRepo = (cPath, sync = false) => {
	if (sync) {
		try {
			return readResolve(repoPathConfig(cPath), sync); // catches in case of fail
		} catch (err) {
			return readResolve(homePathConfig(cPath), sync); // throws in case of fail
		}
	}

	return readResolve(repoPathConfig(cPath), sync) // catches in case of fail
		.catch(() => readResolve(homePathConfig(cPath), sync)); // throws in case of fail
};

// main api
const gitFig = type => getConfig(type, false);

gitFig.sync = type => getConfig(type, true);
Object.assign(gitFig, CONFIG_TYPE);

module.exports = gitFig;

/**
 * Returns parsed ini file as object by config type
 * @param type
 * @param sync
 * @return {Promise<object>|object}
 * @throws if sync
 */
function getConfig(type, sync = false) {
	const configPath = getConfigPath(type, sync);

	return parseIni(configPath, sync);
}

/**
 * Returns parsed ini file as object by path
 * @param cPath
 * @param sync
 * @return {Promise<object>|object}
 * @throws if sync
 */
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

/**
 * Returns config path by config type
 * @param type
 * @param sync
 * @return {Promise<string>|string}
 * @throws if sync
 */
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

	if (type === CONFIG_TYPE.HOME) {
		return getConfigPathHome(sync);
	}

	return getConfigPathCascade(sync);
}

/**
 * Resolves local path if possible, then home path if possible and then custom path
 * @param sync
 * @return {Promise<string>|string}
 * @throws if sync
 */
function getConfigPathCascade(sync = false) {
	if (sync) {
		try {
			return getConfigPathLocal(sync); // catches in case of fail
		} catch (err) {
			return getConfigPathHome(sync); // throws in case of fail
		}
	}

	return getConfigPathLocal(sync) // catches in case of fail
		.catch(() => getConfigPathHome(sync)); // throws in case of fail
}

/**
 * Returns file path if file is available for reading
 * @param fName
 * @param sync
 * @return {Promise<string>|string}
 * @throws if sync
 */
function readResolve(fName, sync = false) {
	if (sync) {
		tryRead(fName, sync);

		return fName;
	}

	return tryRead(fName, sync).then(() => fName);
}

/**
 * Check if file is available for reading
 * @param fName
 * @param sync
 * @return {Promise|undefined}
 * @throws if sync
 */
function tryRead(fName, sync = false) {
	if (sync) {
		return fs.accessSync(fName, fs.constants.R_OK);
	}

	return new Promise((resolve, reject) => fs.access(fName, fs.constants.R_OK, err => err ? reject(err) : resolve()));
}
