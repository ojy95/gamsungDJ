<template>
<div>
    <h3 class="mt-4 mb-5" v-if="userLikeSong.length>=1">곡</h3>
    <b-row>
        <b-colxx cols="2" class="mb-4 pl-3 pr-3" v-for="(song, index) in userLikeSong" :key="index" v-if="isLike(song.id)">
            <div>
                <b-card no-body>
                    <div class="position-relative">
                        <a href="#" @click.prevent="songDetail(song.id)">
                            <img class="card-img-top" :src="song.img" alt="Card cap" />
                        </a>
                    </div>
                    <b-card-body>
                        <a href="#" @click.prevent="songDetail(song.id)"><h6 class="mb-4 ellipsis">{{ song.name }}</h6></a>
                        <a href="#" @click.prevent="artistDetail(song.artist[0].id)"><p class=" mb-0 font-weight-light ellipsis">{{ song.artist[0].name }}</p>
                        </a>
                        <div class="mt-4" style="font-size:x-large;">
                            <span class="glyph-icon simple-icon-control-play mr-3" style="cursor:pointer;" @click="addToPlaylistAndPlay(song)"></span>
                            <span v-if="isLike(song.id)" class="glyph-icon simple-icon-heart mr-3 liked" style="cursor:pointer;" @click="likeSong(song.id)"></span>
                            <span v-else class="glyph-icon simple-icon-heart mr-3" style="cursor:pointer;" @click="likeSong(song.id)"></span>
                            <b-dropdown variant="empty" toggle-class="p-0 m-0 pt-1 pl-1" no-caret style="position:absolute;">
                                <template slot="button-content">
                                    <span class="glyph-icon simple-icon-playlist text-secondary" style="font-size:x-large; cursor:pointer;"></span>
                                </template>
                                <b-dropdown-item @click="addToPlaylistAndNotify(data)">현재 재생목록</b-dropdown-item>
                                <b-dropdown-item v-for="(playlist, index) in userPlayList" :key="index" @click="addToUserPlaylist(song, playlist, index)">{{ playlist.name }}</b-dropdown-item>
                            </b-dropdown>
                        </div>
                    </b-card-body>
                </b-card>
            </div>
            
        </b-colxx>
    </b-row>
    <hr>
    <h3 class="mt-4 mb-5" v-if="userLikeAlbum.length>=1">앨범</h3>
    <b-row>
    <b-colxx cols="2" class="mb-4 pl-3 pr-3" style="display: inline-flex;" v-for="(album, index) in userLikeAlbum" v-bind:key="index">
            <b-card no-body  style=" cursor:pointer;" >
                <div class="position-relative">
                    <img :src="album.img" class="card-img-top"/>
                </div>
                <b-card-body>
                    <b-row>
                        <b-colxx>
                            <h6 style="font-weight :bold; cursor: pointer;" @click="albumDetail(album.id)">{{album.name}}</h6>
                            <p><a v-for="(singer, index) in album.artist" v-bind:key="index" @click="artistDetail(singer.id)">{{singer.name}}</a></p>
                            <p v-if="album.genre">장르:<a v-for="(genre, index) in album.genres" v-bind:key="index"> {{genre.name}}</a></p>
                            <p>발매일: {{dateformat(album.released_date)}}</p>
                            <span class="glyph-icon simple-icon-heart mr-3 liked" style="cursor:pointer; font-size: 1.5rem;"  v-if="checkLikeAlbum(album.id)" @click="likeAlbum(album.id)"></span>
                            <span class="glyph-icon simple-icon-heart mr-3" style="cursor:pointer; font-size: 1.5rem;"  v-else width="32px;"  @click="likeAlbum(album.id)"></span>
            
                        </b-colxx>
                    </b-row>
                </b-card-body>
            </b-card>
    </b-colxx>
    </b-row>
</div>
</template>

<script>
import http from '@/utils/http-common'
import http2 from '@/utils/http-user'
import { mapState, mapGetters, mapActions } from 'vuex'
import axios from 'axios'
const youtubeURL = 'https://www.googleapis.com/youtube/v3/search'
const API_KEY = process.env.VUE_APP_YOUTUBE_API_KEY
export default {
    data() {
        return {
            songs: [],
            albums: []
        }
    },
    methods: {
        ...mapActions(["addToPlaylist", "likeSong", "likeAlbum"]),
        isLike(songId) {
            if (this.user)
                return this.user.like_songs.includes(songId)
            else
                return false

        },
        async addToPlaylistAndNotify(data) {
            this.addToPlaylist(data)
            this.$notify('primary', "재생 목록에 추가 되었습니다.", data.name+" - "+data.artist[0].name, { duration: 4000, permanent: false })
        },
        addToUserPlaylist(data, playlist, index) {
            console.log(data)
            console.log(playlist)
            http2
            .post(`playlist/${playlist.id}/song/`, {'songs': [data.id]}, this.config)
            .then((value)=> {
                this.$notify('primary', "사용자 재생 목록에 추가 되었습니다.", data.name+" - "+data.artist[0].name, { duration: 4000, permanent: false })
                this.userPlayList[index].song.push(data)
            })
        },
        dateformat(albumDate) {
            return albumDate.substr(0,4) + "-" + albumDate.substr(4,2) + "-" + albumDate.substr(6,2);
        },
        async fetchYoutubeId(song) {
          const { data } = await axios.get(youtubeURL, {
            params: {
              key: API_KEY,
              part: 'snippet',
              maxResults: 1,
              type: 'video',
              q: song.artist[0].name + ' ' + song.name
            }
          })
          const { items } = data
          const { videoId } = items[0].id
          const reqData = {'src': videoId}
          song['src'] = videoId
          await http.post(`addsrc/${song.id}/`, reqData,'')
        },
        // 한곡 재생
        async addToPlaylistAndPlay(song) {
            this.$store.state.playerControl = "pause"
            if (song['src']) {
                this.playlist.unshift(song)
                this.$store.state.playerControl = "add"
                this.$notify('primary', "재생 중인 곡", song.name+" - "+song.artist[0].name, { duration: 4000, permanent: false })
            } else {
                await this.fetchYoutubeId(song)
                this.playlist.unshift(song)
                this.$store.state.playerControl = "add"
                this.$notify('primary', "재생 중인 곡", song.name+" - "+song.artist[0].name, { duration: 4000, permanent: false })
            }
        },
        checkLikeAlbum(id) {
            return this.user.like_albums.includes(id)
        },
        songDetail(id) {
            this.$router.push(`/A505/songDetail/${id}`)
        },
        artistDetail(id) {
            this.$router.push(`/A505/artistDetail/${id}`)
        },
        albumDetail(id) {
            this.$router.push(`/A505/albumDetail/${id}`)
        }

    },
    computed: {
        ...mapState(['user', 'playlist', 'userPlayList', 'userLikeSong', 'userLikeAlbum']),
        ...mapGetters(['config'])
    },

}
</script>

<style>

</style>