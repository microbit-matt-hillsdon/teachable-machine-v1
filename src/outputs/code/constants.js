const extensionVersion = "840786df3b4b16d532f73a976fb6890472c71e75";

const pxtJson = JSON.stringify({
    name: "TMv1Integration",
    description: "",
    dependencies: {
        core: "*",
        microphone: "*",
        radio: "*", // Needed to compile.
        "TM Extension": `github:microbit-grace/tm-extension#${extensionVersion}`,
    },
    files: ["main.ts", "main.blocks", "README.md"],
    preferredEditor: "blocksprj",
});

const generateMakeCodeProject = (overrideText) => {
    return {
        header: {
            target: "microbit",
            targetVersion: "8.0.16",
            editor: "blocksprj",
            name: "TMv1Integration",
            meta: {},
            pubId: "",
            pubCurrent: false,
            id: "ad5c181a-e6d9-4f62-8e18-4fd34b7617f6",
            recentUse: 1759408610,
            modificationTime: 1759408610,
            path: "TMv1Integration",
            cloudCurrent: false,
            saveId: null,
            githubCurrent: false,
        },
        text: {
            "pxt.json": pxtJson,
            "README.md": "",
            "main.blocks":
                '<xml xmlns="https://developers.google.com/blockly/xml"><variables></variables><block type="TMMachineLearning_onMLGreenStart" x="35" y="16"></block><block type="TMMachineLearning_onMLPurpleStart" x="36" y="155"></block><block type="TMMachineLearning_onMLOrangeStart" x="30" y="266"></block></xml>',
            "main.ts":
                "TMMachineLearning.onMLOrangeStart(function () {\n\t\n})\nTMMachineLearning.onMLPurpleStart(function () {\n\t\n})\nTMMachineLearning.onMLGreenStart(function () {\n\t\n})\n",
            ...overrideText,
        },
    };
};

export const soundMakeCodeProject = generateMakeCodeProject({
    "main.blocks":
        '<xml xmlns="https://developers.google.com/blockly/xml"><variables></variables><block type="TMMachineLearning_onMLGreenStart" x="35" y="16"><statement name="HANDLER"><block type="music_stop_all_sounds"><next><block type="music_playable_play"><field name="playbackMode">music.PlaybackMode.InBackground</field><value name="toPlay"><shadow type="soundExpression_builtinPlayableSoundEffect"><field name="soundExpression">soundExpression.hello</field></shadow></value></block></next></block></statement></block><block type="TMMachineLearning_onMLPurpleStart" x="31" y="208"><statement name="HANDLER"><block type="music_stop_all_sounds"><next><block type="music_playable_play"><field name="playbackMode">music.PlaybackMode.InBackground</field><value name="toPlay"><shadow type="soundExpression_builtinPlayableSoundEffect"><field name="soundExpression">soundExpression.spring</field></shadow></value></block></next></block></statement></block><block type="TMMachineLearning_onMLOrangeStart" x="29" y="404"></block></xml>',
    "main.ts":
        "TMMachineLearning.onMLOrangeStart(function () {\n\t\n})\nTMMachineLearning.onMLPurpleStart(function () {\n    music.stopAllSounds()\n    music.play(music.builtinPlayableSoundEffect(soundExpression.spring), music.PlaybackMode.InBackground)\n})\nTMMachineLearning.onMLGreenStart(function () {\n    music.stopAllSounds()\n    music.play(music.builtinPlayableSoundEffect(soundExpression.hello), music.PlaybackMode.InBackground)\n})\n",
});

export const ledMakeCodeProject = generateMakeCodeProject({
    "main.blocks":
        '<xml xmlns="https://developers.google.com/blockly/xml"><variables></variables><block type="TMMachineLearning_onMLGreenStart" x="0" y="0"><statement name="HANDLER"><block type="basic_show_icon"><field name="i">IconNames.Heart</field></block></statement></block><block type="TMMachineLearning_onMLPurpleStart" x="-1" y="164"><statement name="HANDLER"><block type="basic_show_icon"><field name="i">IconNames.Happy</field></block></statement></block><block type="TMMachineLearning_onMLOrangeStart" x="4" y="344"><statement name="HANDLER"><block type="device_clear_display"></block></statement></block></xml>',
    "main.ts":
        "TMMachineLearning.onMLOrangeStart(function () {\n    basic.clearScreen()\n})\nTMMachineLearning.onMLPurpleStart(function () {\n    basic.showIcon(IconNames.Happy)\n})\nTMMachineLearning.onMLGreenStart(function () {\n    basic.showIcon(IconNames.Heart)\n})\n",
});

export const servoMakeCodeProject = generateMakeCodeProject({
    "main.blocks":
        '<xml xmlns="https://developers.google.com/blockly/xml"><variables></variables><block type="TMMachineLearning_onMLGreenStart" x="0" y="0"><statement name="HANDLER"><block type="servossetslowwave"><field name="servoPin">ServoPinNumber.P0</field></block></statement></block><block type="TMMachineLearning_onMLPurpleStart" x="-4" y="155"><statement name="HANDLER"><block type="servossetfastwave"><field name="servoPin">ServoPinNumber.P0</field></block></statement></block><block type="TMMachineLearning_onMLOrangeStart" x="-11" y="313"><statement name="HANDLER"><block type="servosstopwave"><field name="servoPin">ServoPinNumber.P0</field></block></statement></block></xml>',
    "main.ts":
        "TMMachineLearning.onMLOrangeStart(function () {\n    servos.stopWave(ServoPinNumber.P0)\n})\nTMMachineLearning.onMLPurpleStart(function () {\n    servos.setFastWave(ServoPinNumber.P0)\n})\nTMMachineLearning.onMLGreenStart(function () {\n    servos.setSlowWave(ServoPinNumber.P0)\n})\n"
});
