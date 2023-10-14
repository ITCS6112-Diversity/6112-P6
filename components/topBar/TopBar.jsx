import React from 'react';
import {
  AppBar, Toolbar, Typography
} from '@mui/material';
import './TopBar.css';
import { withRouter } from "react-router";
import fetchModel from '../../lib/fetchModelData';

/**
 * Define TopBar, a React component of project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      version: null
    };
  }

  componentDidMount() {
    if (this.props.location.pathname.split("/")[2] !== undefined){
      this.getUserData();
    }
    this.getVersionData();
  }
  
  componentDidUpdate(prevProps){
    if (this.props.location.pathname !== prevProps.location.pathname && this.props.location.pathname.split("/")[2] !== undefined){
      this.getUserData();
    }
  }

  getUserData() {
    fetchModel("http://localhost:3000/user/" + this.props.location.pathname.split("/")[2]).then((response) => {
      this.setState({ user: response.data });
    });
  }

  getVersionData(){
    fetchModel("http://localhost:3000/test/info").then((response) => {
      this.setState({ version: response.data });
    });
  }

  getPath(){
    return this.props.location.pathname.split("/")[1];
  }

  userContext(){
    if (this.getPath() === "photos") {
      return ("Photos of " + this.state.user.first_name + " " + this.state.user.last_name);
    } else if (this.getPath() === "users"){
      return (this.state.user.first_name + " " + this.state.user.last_name);
    } else {
      return ("");
    }
  }

  render() {
    return (
      <AppBar className="topbar-appBar" position="absolute">
        <Toolbar className="topbar-toolbar">
          <Typography variant="h5" color="inherit">
            ITCS-6112 Team Diversity&apos;s Photo Sharing App &nbsp;
            <i>Version: {this.state.version && (this.state.version.__v)}</i> 
          </Typography>
          <Typography variant="h5">
            {this.state.user && (this.userContext())}
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }
}

const TopBarComponent = withRouter(TopBar);

export default TopBarComponent;
