class Menu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            page: 1,
            dataSet: null,
            user: 0,
            totalPages: 0
        }
    }

    // initial load of the pages
    componentDidMount() {

        // taking all posts of users
        fetch(`/following-posts/${this.state.page}`)
                .then((response) => response.json())
                .then((data) => {
            this.setState({dataSet: data}, function() {
            });
        });

        // taking information about current user (such as logged in, profile)
        fetch("/user")
            .then((response) => response.json())
            .then((result) => {
                this.setState({user: result});
            });

        // taking information about number of pages to display
        fetch(`/following-posts/0`)
        .then((response) => response.json())
        .then((data) => {
            this.setState({totalPages: data})
            });
    }

    // rendering main structure
    render() {
        
        // showing following users only if user is signed in (for users, who love to use path, not links)
        if (this.state.user.authenticated == true){
            return (
                <div>
                    <nav aria-label="Page navigation example">
                        <ul className="pagination"> 
                            <ButtonNext onPageChange={this.handlePageChange} page={this.state.page} totalPages={this.state.totalPages}></ButtonNext>
                            <ButtonPrevious onPageChange={this.handlePageChange} page={this.state.page} totalPages={this.state.totalPages}></ButtonPrevious>
                        </ul>
                    </nav> 
                    <div>
                        <Posts page={this.state.page} data={this.state.dataSet} reload={this.likeReload} user={this.state.user}></Posts>
                    </div>
                </div>
            );
        } else {
            return (
                null
            );
        }
        
    }

    // when like button is clicked, fetch new data set, and render a page
    likeReload = (value) => {
        if (value) {
            fetch(`/following-posts/${this.state.page}`)
            .then((response) => response.json())
            .then((data) => {
                this.setState({dataSet: data})
            })
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
            fetch(`/following-posts/${this.state.page}`)
                .then((response) => response.json())
                .then((data) => {
            this.setState({dataSet: data}, function() {
            });
        })
        });
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
        fetch(`like-post/${this.props.data[this.props.id]['id']}`, {
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
            // security check, if somebody wants to update post without clicking edit
            if (this.state.editMode == true && this.state.editPostId == this.props.data[this.props.id]["id"]) {
                fetch("update-post", {
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
        // to see the post user need to ve signed in
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
            
                return (
                    <div className="post-container">
                        <div className="card-body">
                        <a href={'profile/' + this.props.data[this.props.id]['owner']} className="card-title">{this.props.data[this.props.id]['owner']}</a>
                            <div className="card-subtitle mb-2 text-muted">{this.props.data[this.props.id]['timestamp']}</div>
                            <div className="text-holder">{this.props.data[this.props.id]['text']}</div>
                            <div className="heart_container">
                                <i id={color} onClick={this.sendRequest} className={heartStyle}></i> 
                            </div>
                            <div id="likes" className={counterStyle}>{this.props.data[this.props.id]['likes']}</div>
                        </div>
                    </div>
                );
            
            } else {
                return null
            }
        } else {
            // if not, do not show the post
            if (!this.props.data) {
                return (
                    null
                )
            }
            
        }
        
    }
    
}



ReactDOM.render(<Menu />, document.querySelector('#menu-posts'))
