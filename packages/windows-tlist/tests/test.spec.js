var assert = require('chai').assert;

describe('tlist', function() {
	var tlist = require('../index');

	it('should return process info', function shouldReturnProcessInfo(done) {
		tlist.getProcessInfo()
			.then(function afterData(info) {
                assert.isTrue(!!(info.modules && info.modules.length));

                var module = info.modules.find(x => /ntdll.dll$/gi.test(x.path));
                assert.isTrue(!!module);
                assert.isTrue(!!module.version);
                assert.isTrue(!!module._attributes);
                assert.isTrue(!!module.address);
                assert.isTrue(!!module.path);

                assert.isTrue(!!(info.threads && info.threads.length));

                var thread = info.threads[0];
                assert.isTrue(!!thread);
                assert.isTrue(!!thread.id);
                assert.isTrue(!!thread.startAddress);
                assert.isTrue(!!thread.lastError);
                assert.isTrue(!!(thread.state && thread.state == 'running'));

                assert.isTrue(!!info.virtualMemory);
                assert.isTrue(!!info.virtualMemory.current);
                assert.isTrue(!!info.virtualMemory.peak);

                assert.isTrue(!!info.workingMemory);
                assert.isTrue(!!info.workingMemory.current);
                assert.isTrue(!!info.workingMemory.peak);

                assert.isTrue(!!info.workingDirectory);
                assert.isTrue(!!info.command);
                assert.isTrue(!!info.threadCount);

				done();
			})
			.catch(function caught(e) {
				done(e);
			});
	});
});
