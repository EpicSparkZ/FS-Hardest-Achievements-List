import { fetchLeaderboard } from '../content.js';
import { localize } from '../util.js';

import Spinner from '../components/Spinner.js';

export default {
    components: {
        Spinner,
    },
    data: () => ({
        leaderboard: [],
        loading: true,
        selected: 0,
        err: [],
    }),
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-leaderboard-container">
            <div class="page-leaderboard">
                <div class="error-container">
                    <p class="error" v-if="err.length > 0">
                        Leaderboard may be incorrect, as the following levels could not be loaded: {{ err.join(', ') }}
                    </p>
                </div>
                <div class="board-container">
                    <table class="board">
                        <tr v-for="(ientry, i) in leaderboard">
                            <td class="rank">
                                <p class="type-label-lg" :id="'rank-' + i">#{{ i + 1 }}</p>
                            </td>
                            <td class="total">
                                <p class="type-label-lg" :id="'total-' + i">{{ localize(ientry.total) }}</p>
                            </td>
                            <td class="user" :class="{ 'active': selected == i }">
                                <button @click="selected = i">
                                    <span class="type-label-lg" :id="'user-' + i">{{ ientry.user }}</span>
                                </button>
                            </td>
                        </tr>
                    </table>
                </div>
                <div class="player-container">
                    <div class="player">
                        <h1>#{{ selected + 1 }} {{ entry.user }}</h1>
                        <h3>{{ entry.total }}</h3>
                        <h2 v-if="entry.verified.length > 0">Verified ({{ entry.verified.length}})</h2>
                        <table class="table">
                            <tr v-for="score in entry.verified">
                                <td class="rank">
                                    <p>#{{ score.rank }}</p>
                                </td>
                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                                </td>
                                <td class="score">
                                    <p>+{{ localize(score.score) }}</p>
                                </td>
                            </tr>
                        </table>
                        <h2 v-if="entry.completed.length > 0">Completed ({{ entry.completed.length }})</h2>
                        <table class="table">
                            <tr v-for="score in entry.completed">
                                <td class="rank">
                                    <p>#{{ score.rank }}</p>
                                </td>
                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                                </td>
                                <td class="score">
                                    <p>+{{ localize(score.score) }}</p>
                                </td>
                            </tr>
                        </table>
                        <h2 v-if="entry.progressed.length > 0">Progressed ({{entry.progressed.length}})</h2>
                        <table class="table">
                            <tr v-for="score in entry.progressed">
                                <td class="rank">
                                    <p>#{{ score.rank }}</p>
                                </td>
                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.percent }}% {{ score.level }}</a>
                                </td>
                                <td class="score">
                                    <p>+{{ localize(score.score) }}</p>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    `,
    computed: {
        entry() {
            return this.leaderboard[this.selected];
        },
    },
    async mounted() {
        let [leaderboard, err] = await fetchLeaderboard();
        leaderboard = leaderboard.filter(entry => entry.user !== 'N/A');
        this.leaderboard = leaderboard;
        this.err = err;
        this.loading = false;
        this.injectGlowStyles();
        this.applyRankEffects();
    },
    methods: {
        localize,
        injectGlowStyles() {
            const style = document.createElement('style');
            style.innerHTML = `
                @keyframes breathingGold {
                    0% { text-shadow: 0 0 5px rgba(255, 215, 0, 0); }
                    100% { text-shadow: 0 0 20px rgba(255, 215, 0, 0.8); }
                }
                @keyframes breathingSilver {
                    0% { text-shadow: 0 0 5px rgba(192, 192, 192, 0); }
                    100% { text-shadow: 0 0 20px rgba(192, 192, 192, 0.8); }
                }
                @keyframes breathingBronze {
                    0% { text-shadow: 0 0 5px rgba(205, 127, 50, 0); }
                    100% { text-shadow: 0 0 20px rgba(205, 127, 50, 0.8); }
                }
                .glow-gold {
                    font-weight: bold;
                    color: #FFD700;
                    animation: breathingGold 3s infinite alternate;
                }
                .glow-silver {
                    font-weight: bold;
                    color: #C0C0C0;
                    animation: breathingSilver 3s infinite alternate;
                }
                .glow-bronze {
                    font-weight: bold;
                    color: #CD7F32;
                    animation: breathingBronze 3s infinite alternate;
                }
            `;
            document.head.appendChild(style);
        },
        applyRankEffects() {
            this.$nextTick(() => {
                const applyEffect = (index, className) => {
                    const rank = document.querySelector(`#rank-${index}`);
                    const user = document.querySelector(`#user-${index}`);
                    const total = document.querySelector(`#total-${index}`);
                    [rank, user, total].forEach(el => {
                        if (el) el.classList.add(className);
                    });
                };
                applyEffect(0, 'glow-gold');
                applyEffect(1, 'glow-silver');
                applyEffect(2, 'glow-bronze');
            });
        }
    },
};
