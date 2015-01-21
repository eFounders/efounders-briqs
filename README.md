
# briqs, the virtual currency on Slack

## Introduction


## How to install

You should do this process on a Mac or a Linux computer.

Each time a line start with a `$`, it means you have to type the command in the terminal.

- Open a terminal and type:

  $ git clone https://github.com/efounders/efounders-briqs.git
  $ cd efounders-briqs
  $ cp settings.json.default settings.json

- Open the file `settings.json`

- Open a browser to https://api.slack.com/web#basics

- Click on `Create token` if needed
- Copy paste the Token starting by `xoxp-` in the `slackToken` of `settings.json`

- Open a browser to https://api.slack.com/methods/auth.test/test
- Click on `Go`
- Set the `slackTeamId` with the team id (start with a `T`)

![auth_test___slack](https://cloud.githubusercontent.com/assets/6358235/5840682/a3d91fda-a197-11e4-9e49-76ce8fcd0d2c.png)

- Find the subdomain you want to use to host your server, you can try the name of your slack team or anything that is available:

  $ meteor deploy **the-name-of-your-slack-team** --settings settings.json

- Open a browser to `http://**the-name-of-your-slack-team**.meteor.com`

- Click on the button `Configure Slack Login` and follow the instruction in the modal

- Click on the button `Sign in with Slack`

- You should see the leaderboard with all member of your Slack team

- Open a browser to https://slack.com/services/new/slash-commands

- Set the command name to `/briq` and click on `Add Slash Command Integration` 

- Set the `URL` to `http://**the-name-of-your-slack-team**.meteor.com/slackCommands`

- Set `Method` to `GET`

- Click on `Save Integration`

- Do the same thing for the command `give`:

- Open a browser to https://slack.com/services/new/slash-commands

- Set the command name to `/give` and click on `Add Slash Command Integration` 

- Set the `URL` to `http://**the-name-of-your-slack-team**.meteor.com/slackCommands`

- Set `Method` to `GET`

- Click on `Save Integration`

Voila!

You can type `/briq` on Slack to see how many briq you have and can give.

You can give briqs with `/give john 1 for the help` on Slack to give one briq.
