/* Copyright 2018 Kevin Zatloual. All rights reserved. */

import React from 'react';


export default class ModelsPanel extends React.Component {
  render() {
    var models = [];
    for (var i = 0; i < this.props.models.length; i++) {
      if (this.props.current === i) {
        models.push(
            <li key={i}
                style={{background: '#d0d0d0', borderRadius: '2px',
                        listStyle: 'none', padding: '2px 0px 2px 5px'}}>
              &bull; <b>{this.props.models[i].name}</b>
            </li>);
      } else {
        models.push(
            <li key={i}
                style={{borderRadius: '2px',
                        listStyle: 'none', padding: '2px 0px 2px 5px'}}>
            &bull; <a href={"#table"+i} className="table-link"
                      onClick={this.selectModel.bind(this, i)}>
                      {this.props.models[i].name}</a>
          </li>);
      }
    }

    return (
      <div className="card card-block" style={{background: '#f0f0f0'}}>
        <div style={{margin: '5px'}}>
          <h3 style={{textAlign: 'center'}}>Models</h3>
          <hr style={{marginTop: '0'}}/>
          <ul style={{padding: '0', margin: '0'}}>{models}</ul>
        </div>
      </div>);
  }

  selectModel(index, evt) {
    evt.preventDefault();
    evt.stopPropagation();

    this.props.onSetCurrent(index);
  }
}
