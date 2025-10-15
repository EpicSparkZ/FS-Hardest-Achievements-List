import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchList } from "../content.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

const roleIconMap = {
    owner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
};

export default {
    components: { Spinner, LevelAuthors },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list">
            <div class="list-container">
                <table class="list" v-if="list">
                    <tr
                        v-for="([level, err], i) in list"
                        :key="i"
                    >
                        <td class="rank">
                            <p
                                v-if="level?.name === 'HAUNTED'"
                                class="type-label-lg"
                                :style="{ color: tributeColor }"
                            >Tribute</p>
                            <p v-else-if="i === 0" class="type-label-lg" :style="rankStyle(0)">#1</p>
                            <p v-else-if="i === 1" class="type-label-lg" :style="rankStyle(1)">#2</p>
                            <p v-else-if="i === 2" class="type-label-lg" :style="rankStyle(2)">#3</p>
                            <p v-else-if="i + 1 <= 31" class="type-label-lg">#{{ i + 1 }}</p>
                            <p v-else-if="i + 1 <= 51" class="type-label-lg">Legacy</p>
                            <p v-else class="type-label-lg">Super Legacy</p>
                        </td>
                        <td class="level" :class="{ 'active': selected == i, 'error': !level }">
                            <button @click="selected = i">
                                <span class="type-label-lg">{{ level?.name || \`Error (\${err}.json)\` }}</span>
                            </button>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="level-container" :class="{ 'rainbow-background': level?.name === 'HAUNTED' }">
                <div class="level" v-if="level">
                    <h1
                        :class="{ 'rainbow-title': level.name === 'HAUNTED' }"
                        :style="level.name === 'HAUNTED' ? { color: tributeColor, textShadow: tributeGlow } : {}"
                    >
                        {{ level.name }}
                    </h1>
                    <LevelAuthors :author="level.author" :creators="level.creators" :verifier="level.verifier"></LevelAuthors>
                    <iframe class="video" id="videoframe" :src="video" frameborder="0"></iframe>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Points when completed</div>
                            <p>{{ score(selected + 1, 100, level.percentToQualify) }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">ID</div>
                            <p>{{ level.id }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Enjoyment Rating</div>
                            <p>{{ level.password || 'Free to Copy' }}</p>
                        </li>
                    </ul>
                    <h2>Records</h2>
                    <p v-if="selected + 1 <= 75"><strong>{{ level.percentToQualify }}%</strong> or better to qualify</p>
                    <p v-else-if="selected +1 <= 150"><strong>100%</strong> or better to qualify</p>
                    <p v-else>This level does not accept new records.</p>
                    <table class="records">
                        <tr v-for="record in level.records" class="record">
                            <td class="percent">
                                <p>{{ record.percent }}%</p>
                            </td>
                            <td class="user">
                                <a :href="record.link" target="_blank" class="type-label-lg">{{ record.user }}</a>
                            </td>
                            <td class="mobile">
                                <img v-if="record.mobile" :src="\`/assets/phone-landscape\${store.dark ? '-dark' : ''}.svg\`" alt="Mobile">
                            </td>
                            <td class="hz">
                                <p>{{ record.hz }}Hz</p>
                            </td>
                        </tr>
                    </table>
                </div>
                <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>Looks like something failed to load or is broken at the moment. This may be due to a failure in code, or an invalid level file. Please contact a list developer if this continues for over 24 hours.</p>
                </div>
            </div>
            <div class="meta-container">
                <div class="meta">
                    <div class="errors" v-show="errors.length > 0">
                        <p class="error" v-for="error of errors">{{ error }}</p>
                    </div>
                    <div class="og">
                        <p class="type-label-md">Website layout made by <a href="https://tsl.pages.dev/" target="_blank">TheShittyList</a></p>
                    </div>
                    <template v-if="editors">
                        <h3>List Editors</h3>
                        <ol class="editors">
                            <li v-for="editor in editors">
                                <img :src="\`/assets/\${roleIconMap[editor.role]}\${store.dark ? '-dark' : ''}.svg\`" :alt="editor.role">
                                <a v-if="editor.link" class="type-label-lg link" target="_blank" :href="editor.link">{{ editor.name }}</a>
                                <p v-else>{{ editor.name }}</p>
                            </li>
                        </ol>
                    </template>
                    <h3>Submission Requirements</h3>
                    <p>Achieved the record without using hacks (however, FPS bypass is allowed, up to 360fps)</p>
                    <p>Achieved the record on the level that is listed on the site - please check the level ID before you submit a record</p>
                    <p>Have either source audio or clicks/taps in the video. Edited audio only does not count</p>
                    <p>The recording must have a previous attempt and entire death animation shown before the completion, unless the completion is on the first attempt. Everyplay records are exempt from this</p>
                    <p>The recording must also show the player hit the endwall, or the completion will be invalidated.</p>
                    <p>Do not use secret routes or bug routes</p>
                    <p>Do not use easy modes, only a record of the unmodified level qualifies</p>
                    <p>Once a level falls onto the Legacy List, we accept records for it for 24 hours after it falls off, then afterwards we never accept records for said level</p>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        list: [],
        editors: [],
        loading: true,
        selected: 0,
        errors: [],
        roleIconMap,
        store,
        tributeColor: '#ff0000',
        tributeGlow: '0 0 15px rgba(255, 0, 0, 0.85)',
    }),
    computed: {
        level() {
            return this.list[this.selected][0];
        },
        video() {
            if (!this.level.showcase) {
                return embed(this.level.verification);
            }
            return embed(this.toggledShowcase ? this.level.showcase : this.level.verification);
        },
    },
    async mounted() {
        this.list = await fetchList();
        this.editors = await fetchEditors();

        if (!this.list) {
            this.errors = ["Failed to load list. Retry in a few minutes or notify list staff."];
        } else {
            this.errors.push(
                ...this.list
                    .filter(([_, err]) => err)
                    .map(([_, err]) => `Failed to load level. (${err}.json)`)
            );
            if (!this.editors) {
                this.errors.push("Failed to load list editors.");
            }
        }

        this.loading = false;

        this.startRainbowEffect();
    },
    methods: {
        embed,
        score,
        startRainbowEffect() {
            let hue = 0;
            const interval = 85;
            const speed = 5;

            const hslToRgb = (h, s, l) => {
                s /= 100;
                l /= 100;
                const k = n => (n + h / 30) % 12;
                const a = s * Math.min(l, 1 - l);
                const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
                return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
            };

            setInterval(() => {
                this.tributeColor = `hsl(${hue}, 100%, 65%)`;
                const [r, g, b] = hslToRgb(hue, 100, 65);
                this.tributeGlow = `0 0 15px rgba(${r}, ${g}, ${b}, 0.80)`;
                hue = (hue + speed) % 360;
            }, interval);
        },
        rankStyle(rank) {
            const colors = ['gold', 'silver', '#cd7f32'];
            let color = colors[rank];
            return {
                color: color,
            };
        },
    },
};
