
class Menu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            page: 1,
            dataSet: null,
            user: 0,
            totalPages: 0,
            profile: 0,
            followed: 0
        }
    }

    // initial load of the pages
    componentDidMount() {

        // taking all posts of users
        fetch(`/users-posts/${this.state.page}`)
                .then((response) => response.json())
                .then((data) => {
            this.setState({
                dataSet: data.posts,
                profile: data.profile,
                followed: data.followed
            }, function() {
            });
        }); 

        // taking information about current user (such as logged in, profile)
        fetch("/user")
            .then((response) => response.json())
            .then((result) => {
                this.setState({user: result});
            });

        // taking information about number of pages to display
        fetch(`/users-posts/0`)
        .then((response) => response.json())
        .then((data) => {
            this.setState({totalPages: data})
            });
    }

    // sending request to follow the user (the server side will deside follow or unfollow)
    handleFollow = (event) => {
        fetch(`/follow-user/${this.state.profile.username}`, {
            method: "POST"
        })
        .then((resp) => resp.json())
        .then((result) => {
            console.log(result);
            this.reload(true)
        })
    }

    // when like button is clicked, fetch new data set, and render a page
    reload = (value) => {
        if (value) {
            fetch(`/users-posts/${this.state.page}`)
            .then((response) => response.json())
            .then((data) => {
            this.setState({
                dataSet: data.posts,
                profile: data.profile,
                followed: data.followed
            }, function() {
            });
        }); 
        fetch("/user")
            .then((response) => response.json())
            .then((result) => {
                this.setState({user: result});
            });
    }
    }

    // When button clicked, changing the states, also loading the new data and passing into Posts
    // also this.setState will "refresh" our page
    handlePageChange = (value) => {
        this.setState({page: value}, function () {
            this.reload(true)
            });
        }

    // rendering main structure
    render() {

        // if user followed the target, show the unfollow button with specific style
        // else: same logic but "Follow"
        let follow = ""
        if (this.state.followed) {follow = "Unfollow"} else {
            follow = "Follow"
        }
        if (this.state.user.authenticated == true) {

            // if users watching himself
            if (this.state.user.username.username == this.state.profile.username){
                return (
                    <div>
                        <div>
                            <h1>{this.state.profile.username}</h1>
                            <h6>Following: {this.state.profile.following}</h6>
                            <h6>Followers: {this.state.profile.followers}</h6>
                        </div>
                        <nav aria-label="Page navigation example">
                            <ul className="pagination"> 
                                <ButtonNext onPageChange={this.handlePageChange} page={this.state.page} totalPages={this.state.totalPages}></ButtonNext>
                                <ButtonPrevious onPageChange={this.handlePageChange} page={this.state.page} totalPages={this.state.totalPages}></ButtonPrevious>
                            </ul>
                        </nav> 
                        <div>
                            <Posts page={this.state.page} data={this.state.dataSet} reload={this.reload} user={this.state.user}></Posts>
                        </div>
                    </div>
                );
            }

            // basic template with following, follow and posts
            return (
                <div>
                        <h1>{this.state.profile.username}</h1>
                        <h6>Followers: {this.state.profile.followers}</h6>
                        <h6>Following: {this.state.profile.following}</h6>
                        <div className="follow">
                            <button id={follow} onClick={this.handleFollow}>{follow}</button>
                        </div>
                    <nav aria-label="Page navigation example">
                        <ul className="pagination"> 
                            <ButtonNext onPageChange={this.handlePageChange} page={this.state.page} totalPages={this.state.totalPages}></ButtonNext>
                            <ButtonPrevious onPageChange={this.handlePageChange} page={this.state.page} totalPages={this.state.totalPages}></ButtonPrevious>
                        </ul>
                    </nav> 
                    <div>
                        <Posts page={this.state.page} data={this.state.dataSet} reload={this.reload} user={this.state.user}></Posts>
                    </div>
                </div>
            );
        } else {

            // if user is not signed in, do not show the follow button
            return (
                <div>
                    <div>
                        <h1>{this.state.profile.username}</h1>
                        <div>Followers: {this.state.profile.followers}</div>
                        <div>Following: {this.state.profile.following}</div>
                    </div>
                    <nav aria-label="Page navigation example">
                        <ul className="pagination"> 
                            <ButtonNext onPageChange={this.handlePageChange} page={this.state.page} totalPages={this.state.totalPages}></ButtonNext>
                            <ButtonPrevious onPageChange={this.handlePageChange} page={this.state.page} totalPages={this.state.totalPages}></ButtonPrevious>
                        </ul>
                    </nav> 
                    <div>
                        <Posts page={this.state.page} data={this.state.dataSet} reload={this.reload} user={this.state.user}></Posts>
                    </div>
                </div>
            );
        }
            
    }
}


class ButtonNext extends React.Component {
   
    // prepairing the props value
    handleChange = (event) => {
        this.props.onPageChange(this.props.page + 1)
    }

    render() {
        // We at the end page, do not loading the button
        if (this.props.page == this.props.totalPages) {
            return (null)
        }
        return (
            <div className="button-background" onClick={this.handleChange}>
                <i className="fas fa-forward"></i>
            </div>
        )   
    }
    
}

class ButtonPrevious extends React.Component {
    
    // prepairing the props value
    handleChange = (event) => {
        this.props.onPageChange(this.props.page - 1)
    }
    render() {
        // case: We on starting page, do not load "Previous" button
        if (this.props.page == 1) {
            return (null)
        }
        return (
            <div className="button-background" onClick={this.handleChange}>
                <i className="fas fa-backward"></i>
            </div>
        )   
    }
    
}

class Posts extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            likes: 0
        }
    }
    
    // when "like" received, get the new data set
    reload = (value) => {
        this.props.reload(value);
    }
    
    render() {
        return (
            <div>
                <Post id={0} reload={this.reload} data={this.props.data} user={this.props.user}></Post>
                <Post id={1} reload={this.reload} data={this.props.data} user={this.props.user}></Post>
                <Post id={2} reload={this.reload} data={this.props.data} user={this.props.user}></Post>
                <Post id={3} reload={this.reload} data={this.props.data} user={this.props.user}></Post>
                <Post id={4} reload={this.reload} data={this.props.data} user={this.props.user}></Post>
                <Post id={5} reload={this.reload} data={this.props.data} user={this.props.user}></Post>
                <Post id={6} reload={this.reload} data={this.props.data} user={this.props.user}></Post>
                <Post id={7} reload={this.reload} data={this.props.data} user={this.props.user}></Post>
                <Post id={8} reload={this.reload} data={this.props.data} user={this.props.user}></Post>
                <Post id={9} reload={this.reload} data={this.props.data} user={this.props.user}></Post>
            </div>
        );
    }
}

class Post extends React.Component {

    constructor(props) {
        super(props);
        this.state={
            editMode: false,
            editPostId: false,
            response: "",
            text: ""
        }
    }
    
    // send request to like the post, after, fetch new data
    sendRequest = (event) => {
        fetch(`/like-post/${this.props.data[this.props.id]['id']}`, {
            method: "POST"
        })
        .then((resp) => resp.json())
        .then((result) => {
            console.log(result)
            this.props.reload(true)
        })
    }

    // handling changes, when user typing
    updateResponse = (event) => {
        this.setState({
            response: event.target.value
        });
    }

    saveAndSend = (event) => {
        // prevents default refresh
        event.preventDefault();
        // when we finished editing the post
        this.setState({
            text: this.state.response,
            response: ""
        }, function () {
            // security check, if somebody wants to update post
            if (this.state.editMode == true && this.state.editPostId == this.props.data[this.props.id]["id"]) {
                fetch("/update-post", {
                    method: "POST",
                    body: JSON.stringify({
                        text: this.state.text,
                        postId: this.props.data[this.props.id]["id"]
                    })
                })
                .then((response) => response.json())
                .then((result) => {
                    console.log(result)
                    // turn off editing mode
                    this.setState({
                        editMode: false,
                        editPostId: false
                    }, function() {
                        // fetch new data from server
                        this.props.reload(true)
                    });
                })
            }
        });
        
    }    

    // switch layout to editing mode
    turnEditMode = (event) => {

        this.setState({
            editMode: true,
            editPostId: this.props.data[this.props.id]["id"]
        });
    }
     
    render() {
        if (this.props.user.authenticated == true) {
            if (!this.props.data) {
                return (
                    null
                )
            }
            
            // "loop" to show posts
            if (this.props.data[this.props.id]) {

                // changing the heart icon depending user liked post or not
                
                const heartEmpty = "far fa-heart";
                const heartFull = "fas fa-heart";
                const counterEmpty = "counter-not-liked";
                const counterFull = "counter-liked";
                const colorBlack = "heart-black";
                const colorRed = "heart-red"

                let heartStyle = "";
                let counterStyle = "";
                let color = "";

                if (this.props.user.liked_posts.includes(this.props.data[this.props.id]["id"])){
                    heartStyle = heartFull;
                    counterStyle = counterFull;
                    color = colorRed
                } else {
                    heartStyle = heartEmpty;
                    counterStyle = counterEmpty;
                    color = colorBlack
                }
                


                // when editing mode is ON, show "editing" layout
                if (this.state.editMode == true && this.state.editPostId == this.props.data[this.props.id]["id"]){
                    
                    return (  
                        <div className="post-container">
                            <div className="card-body">
                            <a href={'/profile/' + this.props.data[this.props.id]['owner']} className="card-title">{this.props.data[this.props.id]['owner']}</a>
                                <div className="card-subtitle mb-2 text-muted">{this.props.data[this.props.id]['timestamp']}</div>
                                <form id="create-post-form">
                                    <textarea className="form-control" id="create-post-textarea" onChange={this.updateResponse} placeholder={this.props.data[this.props.id]['text']} value={this.state.response}></textarea>
                                    <div className="save_container" onClick={this.saveAndSend}>
                                        <i id="save" className="fas fa-save"></i>
                                    </div>
                                </form>
                            </div>
                        </div>
                    );
                }

                // if User is owner of the post, show the Edit button
                if (this.props.data[this.props.id]['owner'] == this.props.user.username.username){
                    return (
                        <div className="post-container">
                            <div className="card-body">
                            <a href={'/profile/' + this.props.data[this.props.id]['owner']} className="card-title">{this.props.data[this.props.id]['owner']}</a>
                                <div className="card-subtitle mb-2 text-muted">{this.props.data[this.props.id]['timestamp']}</div>
                                <div className="text-holder">{this.props.data[this.props.id]['text']}</div>
                                <div className="heart_container">
                                    <i id={color} onClick={this.sendRequest} className={heartStyle}></i> 
                                </div>
                                <div id="likes" className={counterStyle}>{this.props.data[this.props.id]['likes']}</div>
                                <div id="edit_container">
                                    <i id="edit" className="fas fa-pen" onClick={this.turnEditMode}></i> 
                                </div>
                            </div>
                        </div>
                    );
                } else {
                    // else: do not show the edit button
                    return (
                        <div className="post-container">
                            <div className="card-body">
                            <a href={'/profile/' + this.props.data[this.props.id]['owner']} className="card-title">{this.props.data[this.props.id]['owner']}</a>
                                <div className="card-subtitle mb-2 text-muted">{this.props.data[this.props.id]['timestamp']}</div>
                                <div className="text-holder">{this.props.data[this.props.id]['text']}</div>
                                <div className="heart_container">
                                    <i id={color} onClick={this.sendRequest} className={heartStyle}></i> 
                                </div>
                                <div id="likes" className={counterStyle}>{this.props.data[this.props.id]['likes']}</div>
                            </div>
                        </div>
                    );
                }
                
            } else {
                return null
            }
        } else {
            if (!this.props.data) {
                return (
                    null
                )
            }
            // if no one is signed in, show posts without like and edit buttons
            if (this.props.data[this.props.id]) {
                return (
                    <div className="post-container">
                            <div className="card-body">
                            <a href={'/profile/' + this.props.data[this.props.id]['owner']} className="card-title">{this.props.data[this.props.id]['owner']}</a>
                                <div className="card-subtitle mb-2 text-muted">{this.props.data[this.props.id]['timestamp']}</div>
                                <div className="text-holder">{this.props.data[this.props.id]['text']}</div>
                            </div>
                        </div>
                );
            } else {
                return null
            }
        }
        
    }
    
}



ReactDOM.render(<Menu />, document.querySelector('#profile-container'))


 
