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

    async submit(contestId: string, problemId: string, language: string, source: string): Promise<void> {
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

    }

    // getProblem(problemId: string): Promise<string> {
    //     var config = {
    //         method: 'get',
    //         url: 'https://codeforces.com/contest/' + problemId,
}

const cf = new Cf('username', 'password');
cf.login();
