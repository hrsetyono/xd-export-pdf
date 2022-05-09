/*
Copyright 2018 chrometaphore.com

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const reactShim = require("./react-shim");
const style = require("./styles.css");
const React = require("react");
const ReactDOM = require("react-dom");
const exportAssets = require("./exportAssets");

class UI extends React.Component {
    constructor(props) {
        super(props);
        this.onExportClick = (e) => {
            //default behaviour
            //closes the dialog right away.
            e.preventDefault();

            //export assets
            this.export();
        }

        this.onCancelClick = (e) => {
            e.preventDefault();
            this.props.dialog.close();
        }

        this.export = async() => {
            await exportAssets(
                this.props.selection,
                this.props.root
            );

          this.props.dialog.close();
        }
    }

    //on mount, let's force the default value
    //into our format dropdown.
    componentDidMount() {
    }

    //render dialog UI
    render() {
        // Abort if no selection
        if (this.props.selection.items.length <= 0) { return; }

        return (
            <form id="custom-exporter">

                <div className="header">
                    <div className="logoArea">
                        <div className="logo"></div>
                    </div>
                    <div className="title">
                        <h1>Export</h1>
                        <p>Create a PDF from selected layers</p>
                    </div>
                </div>
                <footer>
                    <button uxp-variant="primary"
                            onClick={this.onCancelClick}>Cancel</button>
                    <button uxp-variant="cta"
                            onClick={this.onExportClick}>Export</button>
                </footer>
            </form>
        );
    }
}

let dialog;
function getDialog(selection,root) {
    if (dialog == null) {
        dialog = document.createElement("dialog");
        ReactDOM.render(<UI dialog={dialog} selection={selection} root={root}/>, dialog);
    }
    else {
      //re-rendering..
      ReactDOM.render(<UI dialog={dialog} selection={selection} root={root}/>, dialog);
    }
    return dialog
}

module.exports = {
    commands: {
        menuCommand: function (selection,root) {
            document.body.appendChild(getDialog(selection,root)).showModal();
        }
    }
};
