
# The definitive CF js wrapper

Cf-wrapper is an attempt to programatically interact with codeforces as its current API lacks a lot of features.

Lots to add left, but slow and steady does the job.



## Installation

Install  with npm

```bash
  npm install cf-api
```
## Usage/Examples

```javascript
import Cf from 'cf-api';

const client = new Cf('username', 'password');

const main = async () => {
    const cf = new Cf('username', 'password');
    await cf.login();
    const submission = await cf.submit('1020', 'A', '61', 'int main(void) {\n    cin >> a >> b;\n    cout << a + b;\n    return 0;\n}');
    console.log(submission);
    const contestList = await cf.getContestList(false);
    console.log(contestList);
 }
 main();
```
Output:
```console
167297949
[
  {
    id: 1699,
    name: 'Codeforces Round #804 (Div. 2)',
    type: 'CF',
    phase: 'BEFORE',
    frozen: false,
    durationSeconds: 7200,
    startTimeSeconds: 1656945300,
    relativeTimeSeconds: -762227
  },
  {
    id: 1698,
    name: 'Codeforces Round #803 (Div. 2)',
    type: 'CF',
    phase: 'BEFORE',
    frozen: false,
    durationSeconds: 7200,
    startTimeSeconds: 1656426900,
    relativeTimeSeconds: -243829
  },
...
```


## Roadmap

- Add CLI interface

- Add methods for endpoints exposed by the official codeforces API.

- Proper error handling + error types and messages.

- Add other important methods (e.g. check submission status...)
## Contributing

Contributions are always welcome!

## License

[MIT](https://choosealicense.com/licenses/mit/)

