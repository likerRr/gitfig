import test from 'ava';
import gitFig from '.';

test('api is consistence', t => {
	t.is(typeof gitFig, 'function');
	t.is(typeof gitFig.sync, 'function');
	t.is(typeof gitFig.LOCAL, 'number');
	t.is(typeof gitFig.HOME, 'number');
});
