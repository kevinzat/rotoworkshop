/* Copyright 2018 Kevin Zatloual. All rights reserved. */

import React from 'react';


export default class TableDnD extends React.Component {
  constructor(props) {
    super(props);
    this.state = {dragHover: false};
  }

  handleOnDragEnter(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    this.setState({dragHover: true});
  }

  handleOnDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
  }

  handleOnDragLeave(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    this.setState({dragHover: false});
  }

  handleOnDrop(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    if (evt.dataTransfer && evt.dataTransfer.files) {
      for (var file of evt.dataTransfer.files)
        this.props.onFileUpload(file);
    }

    this.setState({dragHover: false});

    window['gtag']('event', 'upload');
  }

  render() {
    return (
        <div onDragEnter={this.handleOnDragEnter.bind(this)}
             onDragOver={this.handleOnDragOver.bind(this)}
             onDragLeave={this.handleOnDragLeave.bind(this)}
             onDrop={this.handleOnDrop.bind(this)}
             style={{paddingTop: '50px', paddingBottom: '50px',
                     textAlign: 'center',
                     background: this.state.dragHover ? '#e0e0e0' : '#f0f0f0'}}>
          <span style={{pointerEvents: 'none'}}>
              <i>...drop CSV files here...</i></span>
        </div>);
  }
}
