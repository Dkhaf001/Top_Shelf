import React, { Component } from 'react';
import Banner from './components/Banner.jsx';
import View from './components/View.jsx';
import API from './config.js';
import Login from './components/views/Login.jsx';
import Profile from './components/views/Profile.jsx';
import firebase from 'firebase';
import { BrowserRouter as Router } from 'react-router-dom';
import axios from 'axios';

class App extends Component {
  constructor() {
    super();

    this.state = {
      active: true,
      render: 'Postlist',
      email: '',
      firebase: firebase,
      following: true
    };

    this.onChangeHandler = this.onChangeHandler.bind(this);
    this.onClickHandler = this.onClickHandler.bind(this);
    this.onFollowClick = this.onFollowClick.bind(this);
  }

  componentWillMount() {
    var postsArray = [];

    var config = {
      apiKey: API.fireBaseApiKey,
      authDomain: 'top-shelf-708be.firebaseapp.com',
      databaseURL: 'https://top-shelf-708be.firebaseio.com',
      projectId: 'top-shelf-708be',
      storageBucket: 'top-shelf-708be.appspot.com',
      messagingSenderId: '1039726774762'
    };

    firebase.initializeApp(config);

    firebase.auth().onAuthStateChanged((User) => {
      if (User) {
        console.log(User.email, 'logged in!');
        this.setState({
          render: 'Postlist',
          active: true,
          email: User.email
        });
      } else {
        console.log('Logged out!');

        this.setState({
          render: 'Login',
          active: false,
          email: ''
        });
      }
    });
    
    axios.get('/api/users')
    .then(({data})=> {
      this.setState({
        posts: data.posts,
        users: data.users
      });
    })
    .catch(()=> {
      console.log('I am a failure')
    })
    axios.get('/api/following', {params: {username: this.state.email}})
        .then((posts) => {
          this.setState({
            follower: posts
          })
        })
  }

  onChangeHandler(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }
  
  onClickHandler(e) {
    if (e.target.name === 'signin') {
      const errHandler = firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password);
      errHandler.catch((e) => console.log(e.message));
    } else if (e.target.name === 'create') {
      const errHandler = firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password);
      axios.post('/api/user', {
        username: this.state.email,
        bio: 'Enter your bio here.',
        profile_picture: 'https://pvrinstitute.org/handlers/profileimagehandler.ashx?id=5262'
      })
        .then(() => {
          console.log('success');
        })
        .catch(() => {
          console.log('error');
        });
      errHandler.catch((e) => console.log(e.message));
    } else if (e.target.name === 'logout') {
      const errHandler = firebase.auth().signOut();
      errHandler.catch((e) => console.log(e.message));
    } else if (e.target.name === 'follow') {
      this.setState({
        following: !this.state.following
      });
    } 
  }
  onFollowClick(user) {
    console.log(this.state);
    axios.post('/api/follow', {following: user, follower: this.state.email})
      .then(()=> {
        console.log('I worked?')
      })
      .catch(() => {
        console.log('Alex Lied to Me!');
      })
  }

  render() {
    return (
      <Router>
        <div>
          <Banner active={this.state.active} click={this.onClickHandler} userClickHandler={this.userClickHandler} following={this.state.following}/>
          <div className="space"></div>
          <View
            following={this.state.following}
            posts={this.state.posts}
            users={this.state.users}
            click={this.onClickHandler}
            change={this.onChangeHandler}
            active={this.state.active}
            render={this.state.render}
            email={this.state.email}
            firebase={this.state.firebase}
            followclick={this.onFollowClick}
            follower={this.state.follower}
          />
        </div>
      </Router>
    );
  }
}

export default App;