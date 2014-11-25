/**
 * @jsx React.DOM
 * @flow
 */
var React          = require('react');
var Griddle        = require('griddle-react');
var superagent     = require('superagent');
var ModalTrigger   = require('./assets/Modal.jsx').ModalTrigger;
var Modal          = require('./assets/Modal.jsx').Modal;
var columnMetaData = require('./assets/columnMetaData');
var mountNode      = document.getElementById("react-main-mount");

var OtherComponent = React.createClass({
  getDefaultProps: function(){
    return {
      data                      : {},
      map_id                    : "dir-panel",
    };
  },

  componentDidMount: function() {
    //alert(this.props);
    this.setState({
      dirDisplay : new google.maps.DirectionsRenderer
                                    ({draggable : true})
    });
  },

  handleClick: function(){
    //console.log(this.props);
    //console.log(this.state.dirDisplay);
    this.props.callback(this.props.data);
  },

  render: function(){
    return(
      <ModalTrigger>
        <div className="col-md-4" onClick={this.handleClick}>
          <div className="panel panel-default custom-component">
            <div className="row">
              <div className="col-md-6">
                <h4>{this.props.data.name}</h4>
              </div>
              <div className="col-md-6">
                <small>
                  Begin: {this.props.data.start_date} <br></br>
                  End: {this.props.data.end_date}
                </small>
              </div>
            </div>
            <div>{this.props.data.city}</div>
            <div>
              <small>{this.props.data.descr}</small>
            </div>
          </div>
        </div>
      </ModalTrigger>
    );
  }
});

var EventPage = React.createClass({
  getDefaultProps: function() {
    return { 
      data: {},
      route: null
    };
  },

  getInitialState: function() {
    return {
      data: []
    };
  },

  componentDidMount: function() {
    superagent.get('/listEvents', function(res){
      console.log(res.body);
      this.setState({
        data: res.body
      });
    }.bind(this));
  },

  // TODO: fix filtering
  dataMethod: function(filterString, sortColumn, sortAscending,
                                     page, pageSize, callback) {
    var initialIndex = page * pageSize;
    var endIndex = initialIndex + pageSize;
    var parRes;
    if (filterString !== "") {
      parRes = [];
      this.state.data.forEach(function(cell){
        if (cell.origin.indexOf(filterString) !== -1 ||
            cell.dest.indexOf(filterString) !== -1 ||
            cell.name.indexOf(filterString) !== -1  ) 
          parRes.push(cell);
      });
      if (parRes.length === 0) parRes = this.state.data;
    }
    else parRes = this.state.data;
    parRes = parRes.slice(initialIndex, endIndex);
    callback({
      results : parRes,
      totalResults: this.state.data.length
    });
  },

  onCellClick: function(data) {
    this.setState({route : data.route});
  },

  render: function(){
    return(
      <div className="row">
        <div className="header-off" />
        <div className="col-md-12">
        <Modal ref="payload"
            header={this.props.header}
            body={this.props.body}
            footer={this.props.footer}
            route={this.state.route}>
        </Modal>
        <Griddle
          getExternalResults={this.dataMethod}
          columnMetadata={columnMetaData}
          customFormatClassName="row" useCustomFormat="true"
          showFilter="true" tableClassName="table"
          customFormat={OtherComponent} showSettings="true"
          noDataMessage={"Please wait. Data is loading"}
          callback={this.onCellClick}
        />
      </div>
    </div>
    );
  }
});

window.mapLoaded = (function() {
  React.render(<EventPage />, mountNode);
});
