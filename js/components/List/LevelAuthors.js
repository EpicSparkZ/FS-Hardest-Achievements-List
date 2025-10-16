export default {
    props: {
        author: {
            type: String,
            required: true,
        },
        creators: {
            type: Array,
            required: true,
        },
        verifier: {
            type: String,
            required: true,
        },
    },
    template: `
        <div class="level-authors">
            <template v-if="selfVerified">
                <div class="type-title-sm">Creator & Verifier</div>
                <p class="type-body">
                    <span>{{ author }}</span>
                <div class="type-title-sm">Completor</div>
                <p class="type-body">
                    <span>{{ verifier }}</span>
                </p>
            </template>
                </p>
                <div class="type-title-sm">Completor</div>
                <p class="type-body">
                    <span>{{ verifier }}</span>
        </div>
    `,

    computed: {
        selfVerified() {
            return this.author === this.verifier && this.creators.length === 0;
        },
    },
};
