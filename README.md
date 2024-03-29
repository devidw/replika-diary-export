#  Replika Diary Export

This repository is a simple way to export your [replika](https://replika.com) diary to a local JSON file (`./export/diary.json`). All images are exported into a separate folder as well (`./export/images`).


> **Note**
> Looking for a chat export instead? See [replika-chat-export](https://index.garden/replika-export/).


## Installation
```
npm install @devidw/replika-diary-export
```


## Usage
Once you have installed the package, you need to set a few environment variables, which the script will use to identify your account when connecting to the replika API at https://my.replika.com/api/.

These variables are:

* `X_AUTH_TOKEN`
* `X_USER_ID`
* `X_DEVICE_ID`
* `X_TIMESTAMP_HASH`

You can find these variables inspecting the traffic from your developer tools in your browser. To do so, navigate to the network tab and see the request headers to the replika API. From there, you can find the values of the variables and copy them to set the environment variables.

When you are ready, here is how you can export your diary:

```js
import ReplikaDiaryExport from "@devidw/replika-diary-export"

const replikaDiaryExport = new ReplikaDiaryExport()
replikaDiaryExport.export()
```

Once the execution is finished, you will find a file called `diary.json` in the `./export` folder containing the exported diary. As well, you will find a folder called `images` containing all the images exported and downloaded from the replika API.
