import React from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Divider
} from '@mui/material';
import './userPhotos.css';
import { Link } from 'react-router-dom';
import fetchModel from '../../lib/fetchModelData';


/**
 * Define UserPhotos, a React componment of project #5
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photos: null
    };
  }

  componentDidMount() {
    this.getPhotoData();
  }

  getPhotoData() {
    fetchModel("http://localhost:3000/photosOfUser/" + this.props.match.params.userId).then((response) => {
      this.setState({ photos: response.data });
    });
  }

  render() {
    return (
      <div>
        <Grid container spacing={6}>
          
          {this.state.photos && (
            this.state.photos.map((photo) => (
              <Grid item md={3} key={photo._id}>
                <Card sx={{ maxWidth: 500 }}>
                  <CardMedia
                    sx={{ height: 300 }}
                    image={"/images/" + photo.file_name}
                    title="green iguana"
                  />
                  <CardContent>
                    <Typography gutterBottom variant="body1" component="div">
                      Created at: <i>{photo.date_time}</i>
                    </Typography>
                    <Divider/>
                    {
                      (photo.comments.length !== 0) ? photo.comments.map((comment) => (
                        <div key={comment._id}>
                          <Typography className="photos-comment-link" gutterBottom variant="body2" component="div">
                            <Link to={"/users/" + comment.user._id}>
                              <b>{comment.user.first_name + " " + comment.user.last_name}</b>
                            </Link>
                              {" @ "}
                              <i>{comment.date_time}</i>
                              {": "}
                              {comment.comment}
                          </Typography>
                          <Divider/>
                        </div>
                      )) : null
                    }
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </div>
    );
  }
}

export default UserPhotos;
