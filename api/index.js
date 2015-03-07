var Path = require('path');
var Generators = require('yeoman-generator');
var GithubUrlFromGit = require('github-url-from-git');
var GitConfig = require('git-config');


module.exports = Generators.Base.extend({
    constructor: function () {

        Generators.Base.apply(this, arguments);

        this.argument('appName', {
            type: String,
            desc: 'In module format. Ex: `hapi-plot-device`',
            required: true
        });
    },
    init: function () {

        this.pkg = Generators.file.readJSON(Path.join(__dirname, '../package.json'));
    },
    git: function () {

        var done = this.async();
        this.gitConfig = {};

        GitConfig(function (err, config) {

            if (err) {
                return done();
            }

            this.gitConfig = config;
            done();
        }.bind(this));
    },
    askFor: function () {

        var done = this.async();

        var prompts = [{
            name: 'description',
            message: 'Description'
        }, {
            name: 'author',
            message: 'Author',
            default: this.gitConfig.user && this.gitConfig.user.name
        }, {
            name: 'authorEmail',
            message: 'Author email',
            default: this.gitConfig.user && this.gitConfig.user.email
        }, {
            name: 'gitRepo',
            message: 'Git repo'
        }, {
            name: 'keywords',
            message: 'Keywords (space separated)'
        }, {
            name: 'license',
            message: 'License',
            default: 'MIT'
        }];

        this.prompt(prompts, function (answers) {

            this.description = answers.description;
            this.author = answers.author;
            this.authorEmail = answers.authorEmail;
            this.gitRepo = answers.gitRepo;
            this.license = answers.license;
            this.keywords = JSON.stringify(answers.keywords.split(' '));
            this.year = new Date().getFullYear();

            done();
        }.bind(this));
    },
    github: function () {

        this.homepageUrl = GithubUrlFromGit(this.gitRepo);
        this.isGithub = Boolean(this.homepageUrl);

        if (this.isGithub) {
            this.bugsUrl = this.homepageUrl + '/issues';
            var matches = GithubUrlFromGit.re.exec(this.gitRepo);
            this.githubOwner = matches[2].split('/')[0];
        }
        else {
            this.homepageUrl = '';
            this.bugsUrl = '';
        }
    },
    app: function () {

        this.mkdir(this.appName);

        var serverDir = Path.join('server');
        this.mkdir(Path.join(this.appName, serverDir));

        var serverApiDir = Path.join(serverDir, 'api');
        this.mkdir(Path.join(this.appName, serverApiDir));
        this.copy(Path.join(serverApiDir, 'index.js'), Path.join(this.appName, serverApiDir, 'index.js'));

        var testDir = Path.join('test');
        this.mkdir(Path.join(this.appName, testDir));
        this.copy(Path.join(testDir, 'config.js'), Path.join(this.appName, testDir, 'config.js'));
        this.copy(Path.join(testDir, 'index.js'), Path.join(this.appName, testDir, 'index.js'));
        this.copy(Path.join(testDir, 'manifest.js'), Path.join(this.appName, testDir, 'manifest.js'));

        var testArtifactsDir = Path.join(testDir, 'artifacts');
        this.mkdir(Path.join(this.appName, testArtifactsDir));

        var testServerDir = Path.join(testDir, 'server');
        this.mkdir(Path.join(this.appName, testServerDir));

        var testServerApiDir = Path.join(testServerDir, 'api');
        this.mkdir(Path.join(this.appName, testServerApiDir));
        this.copy(Path.join(testServerApiDir, 'index.js'), Path.join(this.appName, testServerApiDir, 'index.js'));

        this.copy('-gitignore', Path.join(this.appName, '.gitignore'));
        this.copy('-travis.yml', Path.join(this.appName, '.travis.yml'));

        this.template('_config.js', Path.join(this.appName, 'config.js'));
        if (this.license.toUpperCase() === 'MIT') {
            this.template('_LICENSE', Path.join(this.appName, 'LICENSE'));
        }
        this.template('_package.json', Path.join(this.appName, 'package.json'));
        this.template('_README.md', Path.join(this.appName, 'README.md'));
        this.copy('index.js', Path.join(this.appName, 'index.js'));
        this.copy('manifest.js', Path.join(this.appName, 'manifest.js'));
        this.copy('server.js', Path.join(this.appName, 'server.js'));
    }
});
