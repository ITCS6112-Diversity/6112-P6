import React from 'react';
import {
  Typography, 
  Grid, 
  Paper
} from '@mui/material';
import { Container } from '@mui/system';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import './userDetail.css';
import axios from 'axios';

/**
 * Define UserDetail, a React component of project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null
    };
  }

  componentDidMount() {
    this.getUserData();
  }

  componentDidUpdate(prevProps){
    if (this.props.match.params.userId !== prevProps.match.params.userId){
      this.getUserData();
    }
  }

  getUserData() {
    axios.get("http://localhost:3000/user/" + this.props.match.params.userId).then((response) => {
      this.setState({ user: response.data });
    });
  }
  
  render() {
    const Item = styled(Paper)(({ theme }) => ({
      backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
      ...theme.typography.body2,
      padding: theme.spacing(1),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    }));


    return (
      <div>
        {this.state.user && (
          <Container>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Item>
                  <Typography variant='h4'>
                    {this.state.user.first_name + " " + this.state.user.last_name}
                  </Typography>
                </Item>
              </Grid>
              <Grid item xs={4}>
                <Item>
                  <Typography>
                    Location: {this.state.user.location}
                  </Typography>
                </Item>
              </Grid>
              <Grid item xs={4}>
                <Item>
                  <Typography>
                      Description: {this.state.user.description}
                  </Typography>
                </Item>
              </Grid>
              <Grid item xs={4}>
                <Item>
                  <Typography>
                      Occupation: {this.state.user.occupation}
                  </Typography>
                </Item>
              </Grid>
              <Grid item xs={12}>
                <Item>
                  <Typography>
                    <Link className="user-photos-link" to={"/photos/" + this.state.user._id}>Go to user photos</Link>
                  </Typography>
                </Item>
              </Grid>
            </Grid>
          </Container>
        )}
      </div>
    );
  }
}

export default UserDetail;
