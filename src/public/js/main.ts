declare const Vue: any;
declare const axios: any;

declare interface DataObject{
  shortUrl:string;
}
declare interface ResponseData {
  rtn:number;
  errMsg:string;
  data:DataObject;
}
declare interface AxiosResponse {
  data: ResponseData;
};

let v = new Vue({
  el: "#app",

  data: {
    longUrl: "",
    shortUrl: "",
    errMsg:null,
  },

  methods: {
    createShortUrl: function () {
      let self = this;

      axios.post('/api/shorturls', {url:self.longUrl}).then(function (reponse: AxiosResponse) {
        let ret = reponse.data;
        console.log(ret);

        if (ret.rtn != 0){
          self.errMsg = ret.errMsg;
          return;
        }

        self.errMsg = ret.errMsg;
        self.shortUrl = ret.data && ret.data.shortUrl;
      })
    },


    clearInput: function(){
      this.longUrl = this.shortUrl = "";
    }
  }

});
