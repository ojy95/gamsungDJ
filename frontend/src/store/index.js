import Vue from 'vue'
import Vuex from 'vuex'
import menu from './modules/menu'
import axios from "axios";
import http from "../utils/http-common";
import http2 from "../utils/http-user";

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    authorization: sessionStorage.getItem("authorization"),
    user: JSON.parse(sessionStorage.getItem('user')),
    climate: sessionStorage.getItem('climate'),
    visiblePlaylist: false,
    visiblePlayButton: true,
    visiblePauseButton: false,
    playlist: [],
    userPlayList: JSON.parse(sessionStorage.getItem('userPlayList')),
    songLikeList: [],
    albumLikeList: [],
    playerControl: '',
    selectedSong: {
      index: -1,
      img: '',
      title: '',
      artist: '',
      src: '',
      lyric: '',
      currentTime: '',
      duration: '',
      volume: '',
      like: '',
      comments: '',
      songID: -1,
      singerID: -1,
    },
    isLoggedin: sessionStorage.getItem('isLoggedin'),
    userLikeSong: JSON.parse(sessionStorage.getItem('userLikeSong')),
    userLikeAlbum: JSON.parse(sessionStorage.getItem('userLikeAlbum')),
  },
  getters: {
    config: (state) => ({headers: {Authorization: state.authorization}}),
    currentUser: (state) => state.user,
  },

  mutations: {
    SET_CLIMATE(state, value) {
      sessionStorage.setItem('climate', value)
      state.climate = value
    },
    SET_PLIST(state, {command, data}) {
      if (command === 'addAndPlay') {
        state.playerControl = 'add'
        state.playlist.unshift(data)
      } else {
        state.playerControl = ''
        state.playlist.push(data)
      }
    },
    SET_AUTH(state, value) {
      sessionStorage.setItem("authorization", value)
      state.authorization = value
    },
    SET_USER(state, value) {
      sessionStorage.setItem("user", JSON.stringify(value))
      state.user = value
      state.songLikeList = value.like_songs
      state.albumLikeList = value.like_albums
      sessionStorage.setItem("isLoggedin", true)
      state.isLoggedin = true
    },
    SET_PLAYLIST(state, value) {
      state.userPlayList = value
      sessionStorage.setItem("userPlayList", JSON.stringify(value))
    },
    SET_USERLIKE(state, value) {
      const songs = value.songs
      const albums = value.albums
      state.userLikeSong = songs
      state.userLikeAlbum = albums
      sessionStorage.setItem('userLikeSong', JSON.stringify(songs))
      sessionStorage.setItem('userLikeAlbum', JSON.stringify(albums))
    },
    SET_SONG_LIKE(state, value) {
      state.songLikeList = value
    },
    SET_USER_LIKE_SONG(state, value) {
      if (typeof(value) == typeof({})) {
        state.userLikeSong.push(value)
      } else {
        state.userLikeSong = state.userLikeSong.filter(song => {
          return song.id !== value
        })
      }
      sessionStorage.setItem("userLikeSong", JSON.stringify(state.userLikeSong))
    },
    SET_USER_LIKE_ALBUM(state, value) {
      if (typeof (value) == typeof({})) {
        console.log("추가", value)
        state.userLikeAlbum.push(value)
      } else {
        console.log("빼기", value)
        state.userLikeAlbum = state.userLikeAlbum.filter(album => {
          return album.id !== value
        })
      }
      sessionStorage.setItem("userLikeAlbum", JSON.stringify(state.userLikeAlbum))

    },
    LOGOUT(state) {
      state.authorization = ""
      state.user = null
      state.isLoggedin = false
      state.userLikeSong = []
      sessionStorage.removeItem("isLoggedin")
      sessionStorage.removeItem("authorization")
      sessionStorage.removeItem("user")
      sessionStorage.removeItem('userPlayList')
      sessionStorage.removeItem('climate')
      sessionStorage.removeItem('userLikeSong')
      sessionStorage.removeItem('userLikeAlbum')
    },
  },
  actions: {
    setClimate({commit}, value) {
      commit('SET_CLIMATE', value)
    },
    setLang({commit}, payload) {
      commit('changeLang', payload)
    },
    setAuth({commit}, value) {
      commit('SET_AUTH', value)
    },
    async setUser({commit}, value) {
      await commit('SET_USER', value)
      this.dispatch('initLike')
    },
    setPlayList({commit, getters}) {
      http2.get('playlist/', getters.config)
        .then((res) => {
          commit('SET_PLAYLIST', res.data)
        })
    },
    // 좋아요
    async initLike({ commit }) {
      const res = await http.get(`song/userlike/`, {headers: {Authorization: this.state.authorization}, params: {id: this.state.user.like_songs} })
      const songList = res.data
      const res2 = await http.get(`album/userlike/`, {headers: {Authorization: this.state.authorization}, params: {id: this.state.user.like_albums}})
      const albumList = res2.data
      commit("SET_USERLIKE", {songs: songList, albums: albumList})
    },
    async likeSong({commit, getters}, id) {
      const songData = await http.get(`song/${id}/`)
      const song = songData.data
      if (this.state.isLoggedin) {
        http.post(`song/${song.id}/like/`, '', getters.config)
        .then((res) => {
          if (res.data.liked) {
            this.state.user.like_songs.push(Number(id))
            Vue.$notify('primary', "♥ 좋아요", song.name + " - " + song.artist[0].name, {duration: 2000, permanent: false})
            commit('SET_USER_LIKE_SONG', song)
          }
          else {
            this.state.user.like_songs = this.state.user.like_songs.filter(songId => {return songId !== Number(id)})
            Vue.$notify('primary', "♡ 좋아요 취소", song.name + " - " + song.artist[0].name, { duration: 2000, permanent: false })
            commit('SET_USER_LIKE_SONG', song.id)
          }
        })
        // sessionStorage user reset
        sessionStorage.setItem("user", JSON.stringify(this.state.user))
      } else {
        Vue.$notify('warning', "로그인이 필요한 서비스입니다.", '', {duration: 4000, permanent: false})
      }
    },
    async likeAlbum({commit, getters}, id) {
      const albumData = await http.get(`album/${id}/`)
      const album = albumData.data.data
      if (this.state.isLoggedin) {
        http.post(`album/${id}/like/`, '', getters.config)
        .then((res) => {
          if (res.data.liked) {
            this.state.user.like_albums.push(Number(id))
            Vue.$notify('primary', "♥ 좋아요", album.name + " - " + album.artist[0].name, {duration: 2000, permanent: false})
            commit('SET_USER_LIKE_ALBUM', album)
          }
          else {
            this.state.user.like_albums = this.state.user.like_albums.filter(albumId => {
              return albumId !== Number(id)
            })
            Vue.$notify('primary', "♡ 좋아요 취소", album.name + " - " + album.artist[0].name, { duration: 2000, permanent: false })
            commit('SET_USER_LIKE_ALBUM', album.id)
          }
        })
        // sessionStorage user reset
        sessionStorage.setItem("user", JSON.stringify(this.state.user))
      } 
      else {
        Vue.$notify('warning', "로그인이 필요한 서비스입니다.", '', {duration: 4000, permanent: false})
      }

    },
    logout({commit}) {
      commit("LOGOUT")
    },
    async fetchYoutubeId({commit}, song) {
      const youtubeURL = 'https://www.googleapis.com/youtube/v3/search'
      const API_KEY = process.env.VUE_APP_YOUTUBE_API_KEY
      const {data} = await axios.get(youtubeURL, {
        params: {
          key: API_KEY,
          part: 'snippet',
          maxResults: 1,
          type: 'video',
          q: song.artist[0].name + ' ' + song.name
        }
      })
      const {items} = data
      const {videoId} = items[0].id
      const reqData = {'src': videoId}
      song['src'] = videoId
      await http.post(`addsrc/${song.id}/`, reqData, '')
    },
    async addToPlaylistAndPlay({commit, dispatch}, data) {
      let value = {
        'command': 'addAndPlay',
        'data': data
      }
      if (data['src']) {
        commit('SET_PLIST', value)
      } else {
        await dispatch('fetchYoutubeId', data)
        commit('SET_PLIST', value)
      }
    },
    async addToPlaylist({commit, dispatch}, data) {
      let value = {
        'command': '',
        'data': data
      }
      if (data['src']) {
        commit('SET_PLIST', value)
      } else {
        await dispatch('fetchYoutubeId', data)
        commit('SET_PLIST', value)
      }
    }
  },
  modules: {
    menu,
    
  }
})
