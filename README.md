ninja-timer
===========

A NinjaBlocks driver to time things!

You can create as many timers as you wish that will count the time elapsed *in minutes* since the ninja client has been started, but can also be set to any number using the API or the rules.

For example, to handle automatic away status so you don't have to worry again about pushing buttons

* Create a timer called *away*
* Create a webhook in the dashboard
* Use on{x} to make your phone call the webhook every 5 minutes while the phone is connected to your home wifi http://forums.ninjablocks.com/index.php?p=/discussion/comment/6907#Comment_6907
* Create a rule that sets the *away* timer to 0 when the webhook is called
* Create a rule that enables your alarm if *away* timer > 10
* Create a rule that disables heating if *away* timer > 60


###Installation

Clone this repo into your drivers folder and install the dependencies. Restart the ninjablock service and you are good to go.

    cd /opt/ninja/drivers
    git clone https://github.com/carlossg/ninja-timer.git
    cd ninja-timer
    npm install
    sudo service ninjablock restart


###Configuration

To add a timer go to the [web settings](https://a.ninja.is/you) - Blocks - Configure - Ninja Timer Configure button and enter a name.

The configuration is stored in

    /opt/ninja/config/ninja-timer/config.json

and can be easily edited

    {
      "config": {
        "timers": {
          "mytimer1": {
            "name": "mytimer1",
            "start": 1392487449552
          },
          "mytimer2": {
            "name": "mytimer2",
            "start": 1392487449554
          },
        }
      }
    }
