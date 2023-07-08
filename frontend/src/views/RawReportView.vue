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
        </section>

    </main>
</template>

<script>
export default {
    data() {
        return {
            rawReportID: null,
            transactions: [],

        }
    },
    async mounted() {
        this.rawReportID = this.$route.params.rid;
        await this.getRawReportTransactions();

    },
    destroyed() {

    },
    methods: {
        async getRawReportTransactions() {
            try {
                const response = await fetch('http://localhost:3000/raw-reports/' + this.rawReportID + '/transactions', {
                    method: 'GET'
                })

                if (!response.ok) {
                    throw new Error('HTTP Error: ' + response.status);
                }
                this.transactions = await response.json();

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
        }
    }
}
</script>