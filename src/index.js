import client from "./client.js";
import qs from 'qs';

import {
    genFtaa,
    genBfaa,
} from "./utils.js";

export default class Cf {

    static csrf = '';
    static ftaa = genFtaa();
    static bfaa = genBfaa();
    static isLoggedIn() {
        return Cf.csrf.length > 0;
    };

    constructor (username, password) {
        this.username = username;
        this.password = password;
    }

    async getCsrf() {
        const config = {
            method: 'get',
            url: 'https://codeforces.com',
        };
        const response = await client(config);
        // Cf.csrf = response.data.match(/<input type="hidden" name="csrf_token" value="(.*?)"/)[1]; Copilot's suggestion, which also works.
        Cf.csrf = response.data.match(/(?<=data-csrf=')[\s\S]*?(?='>&)/)[1];
        return;
    }

    async login() {
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
                if ( response.data.match(/handle = "([\s\S]+?)"/) ) {
                 //console.log('Login success');
                } else {
                    // console.log('Login failed');
                    throw new Error('Login failed');
                }
            })
            .catch(function (error) {
                // console.log(error);
                return error;
            });

    }

    async submit(contestId, problemId, language, source) {
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
        const submission = await client(config)
            .then(function (response) {
                if ( response.data.match(/<table class="status-frame-datatable">/) ) {
                    const submissionRegex = /(?<=submissionId=")[\d]*?(?=">)/;
                    const submissionId = response.data.match(submissionRegex)[0];
                    // console.log('Submission success, submissionId: ' + submissionId);
                    return submissionId;
                } else {
                    // console.log('Submit failed');
                    if ( response.data.match(/You have submitted exactly the same code before/) ) {
                        // console.log('You have submitted exactly the same code before');
                    }
                    throw new Error('Submit failed');
                }
            })
            .catch(function (error) {
                // console.log(error);
                return error;
            }
        );
        return submission;
    }

    async getContestList(gym) {
        const config = {
            method: 'get',
            url: `https://codeforces.com/api/contest.list?gym=${gym}`,
        };
        const contestList = await client(config)
            .then(function (response) {
                if(response.data.status === 'OK') {
                    return response.data;
                } else {
                    // console.log('Get contest list failed');
                    throw new Error('Get contest list failed');
                }
            })
            .catch(function (error) {
                // console.log('Get contest list failed');
                throw new Error('Get contest list failed');
            });
        return contestList.result;
    };

    async getContestProblems(contestId){
        const config = {
            method: 'get',
            url: `https://codeforces.com/api/contest.standings?contestId=${contestId}&from=1&count=1`,
        };
        const contest = await client(config)
            .then(function (response) {
                if(response.data.status === 'OK') {
                    return response.data;
                } else {
                    // console.log('Get contest problems failed');
                    throw new Error('Get contest problems failed');
                }
            }).catch(function (error) {
                // console.log('Get contest problems failed');
                throw new Error('Get contest problems failed');
            });
        return contest.result.problems;
    };

    async getRecentSubmittedProblemStatus(username){
        const config = {
            method: 'get',
            url: `https://codeforces.com/api/user.status?handle=${username}&from=1&count=1`
        }

        const submissionStatus = await client(config).then(
            function(response){
            if(response.data.status == 'OK'){
                return response.data;
            }else{
                throw new Error('Not able to retrieve latest submission')
            }
        }).catch(function(error){
            throw new Error('Not able to retrieve latest submission')
        });
        return submissionStatus.result;
    };

    async getContestStatus(contestId, from, count){
        const config = {
            method: 'get',
            url: `https://codeforces.com/api/contest.status?contestId=${contestId}&from=${from}&count=${count}`
        }

        const contest = await client(config).then(
            function(response){
                if(response.data.status == 'OK'){
                    return response.data;
                } else {
                    throw new Error('Not able to retrieve Contest Status');
                }
            }).catch(function(error){
                throw new Error('Not able to retrieve Contest Status')
            });
        return contest.result;
    };
}