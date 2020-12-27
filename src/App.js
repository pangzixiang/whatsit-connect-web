import React from "react";
import Button from '@material-ui/core/Button';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import LinearProgress from '@material-ui/core/LinearProgress';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import axios from "axios";
import Style from './App.module.css';

class App extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            process: 0,
            total: 1,
            success: false
        }
        this.handleUpload = this.handleUpload.bind(this)
        this.handleClose = this.handleClose.bind(this)
    }

    handleUpload(event) {
        const file = event.target.files[0]
        const chunkSize = 1*1024*1024
        const chunkNum = Math.ceil(file.size/chunkSize)
        this.setState({
            process: 0,
            total: chunkNum,
            success: false
        })
        const data = new FormData()
        let uploadList = []
        data.append("fileName", file.name)
        data.append("chunkNum", chunkNum)
        axios.post("http://"+window.location.host+"/uploadInfo", data, {headers: {"Content-Type": "multipart/form-data"}}).then(r=>{
            if (r.data.msg === "ok") {
                for (let i=0; i < chunkNum; i++) {
                    const data = new FormData()
                    if ((i+1)*chunkSize > file.size)
                        data.append("file",file.slice(i*chunkSize, file.size))
                    else
                        data.append("file", file.slice(i*chunkSize,(i+1)*chunkSize))
                    data.append("index", i)
                    data.append("name", file.name)
                    uploadList.push(axios.post("http://"+window.location.host+"/uploadChunks", data, {headers: {"Content-Type": "multipart/form-data"}}).then(r=>{
                        if (r.data.msg === "ok")
                            this.setState({
                                process: this.state.process + 1
                            })
                    }))
                }
                axios.all(uploadList).then(r=> {
                    this.setState({
                        success: true
                    })
                })
            }
        })


    }


    handleClose(){
        this.setState({
            success: false,
            process: 0
        })
    }

    render() {
     return (
         <div className={Style.App}>
             <Snackbar
                 open={this.state.success}
                 autoHideDuration={6000}
                 onClose={this.handleClose}
                 anchorOrigin={{ vertical: 'top',
                     horizontal: 'center', }}
             >
                 <MuiAlert onClose={this.handleClose} severity="success">
                     传送成功！
                 </MuiAlert>
             </Snackbar>
             <div className={Style.header}>
                 <input
                     accept="*"
                     className={Style.uploadBtn}
                     id="contained-button-file"
                     // multiple
                     type="file"
                     onChange={this.handleUpload}
                 />
                 <label htmlFor="contained-button-file">
                     <Button variant="contained" color="primary" component="span" startIcon={<CloudUploadIcon />}>
                         点我传送
                     </Button>
                 </label>
                 <LinearProgress
                     variant="determinate"
                     value={(this.state.process/this.state.total)*100}
                     color="secondary"
                     className={Style.process}/>
             </div>
         </div>
    )
  }
}


export default App;
