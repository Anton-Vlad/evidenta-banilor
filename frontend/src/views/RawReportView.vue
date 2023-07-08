<template>
    <main>
        <section class="exisiting-statements">
            <h3>Transaction: {{ rawReportID }}</h3>

            <DataTable v-model="transactions" :value="transactions" dataKey="id" tableClass="editable-cells-table"
                :rowClass="rowClass" stripedRows tableStyle="min-width: 50rem">

                <Column field="type" header="Type">
                    <template #body="slotProps">
                        {{ getTransactionSign(slotProps.data.type) }}
                    </template>
                </Column>
                <Column field="price" header="Price">
                    <template #body="slotProps">
                        {{ slotProps.data.price || 'none' }}
                    </template>
                </Column>
                <Column field="tag" header="Tag">
                    <template #body="slotProps">
                        <Dropdown v-model="slotProps.data.tag" :options="transactionTags" optionLabel="name"
                            optionValue="value" placeholder="Select a Tag"
                            :class="`${(slotProps.data.tag ? '' : 'p-invalid')} w-full md:w-10rem`" />
                    </template>
                </Column>

                <Column field="location" header="Location">
                    <template #body="slotProps">
                        {{ getTransactionLocation(slotProps.data) }}
                    </template>
                </Column>
                <Column field="date" header="Date">
                    <template #body="slotProps">
                        {{ slotProps.data.date || 'none' }}
                    </template>
                </Column>
            </DataTable>

            <div class="flex justify-content-end row-gap-3 mt-4 mb-4">
                <Button label="Submit changes" :disabled="!canSubmitChanges" @click="onTransactionsSubmit" />
            </div>
        </section>

    </main>
</template>

<script>
export default {
    computed: {
        canSubmitChanges() {
            let tags = this.transactions.filter(x => x.tag == null);

            return tags.length ? false : true;
        }
    },
    data() {
        return {
            rawReportID: null,
            rawReportData: null,
            transactions: [],

            transactionTags: [
                {
                    name: 'Null',
                    value: null
                },
                {
                    name: 'Operational',
                    value: 'operational'
                },
                {
                    name: 'Dorinta',
                    value: 'dorinta'
                },
                {
                    name: 'Economii',
                    value: 'economii'
                },
                {
                    name: 'Investii',
                    value: 'investitii'
                },
                {
                    name: 'Venit',
                    value: 'venit'
                }
            ]
        }
    },
    async mounted() {
        this.rawReportID = this.$route.params.rid;
        await this.getRawReport();
        // await this.getRawReportTransactions();

    },
    destroyed() {

    },
    methods: {
        async getRawReport() {
            try {
                const response = await fetch('http://localhost:3000/raw-reports/' + this.rawReportID, {
                    method: 'GET'
                })

                if (!response.ok) {
                    throw new Error('HTTP Error: ' + response.status);
                }
                let result = await response.json();
                this.rawReportData = result.report;
                let rawTransactions = result.transactions.map(x => {
                    return { ...x, tag: 'economii' } // null
                })

                this.transactions = rawTransactions;

            } catch (error) {
                console.error('Error:', error);
            }
        },
        async getRawReportTransactions() {
            try {
                const response = await fetch('http://localhost:3000/raw-reports/' + this.rawReportID + '/transactions', {
                    method: 'GET'
                })

                if (!response.ok) {
                    throw new Error('HTTP Error: ' + response.status);
                }
                let rawTransactions = await response.json();

                rawTransactions = rawTransactions.map(x => {
                    return { ...x, tag: 'economii' } // null
                })

                this.transactions = rawTransactions;

            } catch (error) {
                console.error('Error:', error);
            }
        },

        getTransactionSign(transactionType) {
            switch (transactionType) {
                case 'Incasare':
                    return '+'
                    break;

                default:
                    return '-'
                    break;
            }
        },

        rowClass(data) {
            switch (data?.type) {
                case 'Incasare':
                    return 'bg-primary-100 text-primary'
                    break;

                default:
                    return ''
                    break;
            }
        },

        getTransactionLocation(transactionData) {
            let out = '-';

            if (transactionData.location) {
                return transactionData.location;
            }

            let transactionDetails = transactionData.details;
            if (transactionDetails) {
                let locationDetails = [];
                for (let i = 0; i < transactionDetails.length; i++) {
                    if (transactionDetails[i].includes('Beneficiar:') ||
                        transactionDetails[i].includes('Ordonator:')
                    ) {
                        locationDetails.push(transactionDetails[i].split(':')[1])
                    }
                    if (transactionDetails[i].includes('Detalii:')) {
                        locationDetails.push(transactionDetails[i].split(':')[1])
                    }
                }

                if (locationDetails.length == 0) {
                    // if (transactionData.type == 'Rata Credit') {
                    return transactionData.type;
                    // }
                }

                return locationDetails.join(', ');
            }
            return out;
        },


        async onTransactionsSubmit() {
            console.log('Submit transac', this.transactions)
            try {

                console.log('REPORT', this.rawReportData)

                // const response = await fetch('http://localhost:3000/extended-reports/', {
                //     method: 'POST',
                //     headers: {
                //         'Content-Type': 'application/json'
                //     },
                //     body: JSON.stringify({
                //         report:
                //             transactions: this.transactions
                //     })
                // })

                // if (!response.ok) {
                //     throw new Error('HTTP Error: ' + response.status);
                // }
                // let rawTransactions = await response.json();

                // rawTransactions = rawTransactions.map(x => {
                //     return { ...x, tag: 'economii' } // null
                // })

                // this.transactions = rawTransactions;

            } catch (error) {
                console.error('Error:', error);
            }
        }
    }
}
</script>