import client from "./client";
import qs from 'qs';
import fs from 'fs';

import {
    genFtaa,
    genBfaa,
} from "./utils";

class Cf {

    static csrf: string = '';
    static ftaa: string = genFtaa();
    static bfaa: string = genBfaa();
    static isLoggedIn(): boolean {
        return Cf.csrf.length > 0;
    };

    constructor (public username: string, public password: string) {
        this.username = username;
        this.password = password;
    }

    async getCsrf(): Promise<void> {
        const config = {
            method: 'get',
            url: 'https://codeforces.com',
        };
        const response = await client(config);
        // Cf.csrf = response.data.match(/<input type="hidden" name="csrf_token" value="(.*?)"/)[1]; Copilot's suggestion, which also works.
        Cf.csrf = response.data.match(/(?<=data-csrf=')[\s\S]*?(?='>&)/)[1];
        return;
    }

    async login(): Promise<void> {
        await this.getCsrf();
        const data = qs.stringify({
            csrf_token: Cf.csrf,
            action: 'enter',
            handleOrEmail: this.username,
            password: this.password,
            ftaa: Cf.ftaa,
            bfaa: Cf.bfaa,
            _tta: "176",
            remember: "on",
        });
        const config = {
            method: 'post',
            url: 'https://codeforces.com/enter',
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data : data
        };
        await client(config)
            .then(function (response) {
                if ( response.data.match(/handle = "([\s\S]+?)"/).length > 0 ) {
                    console.log('Login success');
                } else {
                    console.log('Login failed');
                    throw new Error('Login failed');
                }
            })
            .catch(function (error) {
                console.log(error);
                return error;
            });

    }

    async submit(contestId: string, problemId: string, language: string, source: string): Promise<string> {
        await this.getCsrf();
        const data = qs.stringify({
            csrf_token: Cf.csrf,
            ftaa: Cf.ftaa,
            bfaa: Cf.bfaa,
            action: 'submitSolutionFormSubmitted',
            submittedProblemIndex: problemId, // problemId is the problem index in the contest (A, B, C, ...)
            contestId: contestId, // contestId is the id of the contest
            source: source, // source code
            programTypeId: language, // Language index
            _tta: '594',
            sourceCodeConfirmed: 'true'
        });
        const config = {
            method: 'post',
            url: 'https://codeforces.com/problemset/submit?csrf_token=' + Cf.csrf,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data : data,
        };
        const submission: string = await client(config)
            .then(function (response) {
                fs.writeFileSync('submit.html', response.data);                
                if ( response.data.match(/<table class="status-frame-datatable">/) ) {
                    const submissionRegex: RegExp = /(?<=submissionId=")[\d]*?(?=">)/;
                    const submissionId: string = response.data.match(submissionRegex)[0];
                    console.log('Submission success, submissionId: ' + submissionId);
                    return submissionId;
                } else {
                    console.log('Submit failed');
                    if ( response.data.match(/You have submitted exactly the same code before/) ) {
                        console.log('You have submitted exactly the same code before');
                    }
                    throw new Error('Submit failed');
                }
            })
            .catch(function (error) {
                console.log(error);
                return error;
            }
        );
        return submission;
    }

    // getProblem(problemId: string): Promise<string> {
    //     var config = {
    //         method: 'get',
    //         url: 'https://codeforces.com/contest/' + problemId,
}
const main = async () => {
    const cf = new Cf('username', 'password');
    await cf.login();
    const submission = await cf.submit('1020', 'A', '61', 'int main(void) {\n    cin >> a >> b;\n    cout << a + b;\n    return 0;\n}');
    console.log(submission);
}
main();
