import * as anchor from "@project-serum/anchor"
import { Commitment, Connection, Keypair, PublicKey } from '@solana/web3.js'
import { DEFAULT_RPC_HOST, DEFAULT_PROGRAM_ID } from '../lib/constants'
import { program as cli } from 'commander'

interface Args {
    commitment: Commitment,
    rpcHost: string,
    programId: string,
}

async function connect() {
    const args = cli.opts<Args>()

    const programId = new PublicKey(args.programId)
    const connection = new Connection(args.rpcHost, args.commitment)

    const wallet = new anchor.Wallet(Keypair.generate()) // TODO from args?

    const provider = new anchor.Provider(connection, wallet, {
        skipPreflight: true
    })

    const idl = await anchor.Program.fetchIdl(programId, provider)

    const program = new anchor.Program(idl!, programId, provider)

    return {
        idl,
        program,
        programId,
    }
}

async function showIDL() {
    const { idl } = await connect()
    console.log(JSON.stringify(idl, null, '  '))
    process.exit(0)
}

cli
    .addHelpCommand()
    .requiredOption('-c, --commitment [string]', 'commitment', 'confirmed')
    .requiredOption('-r, --rpc-host [string]', 'rpc host', DEFAULT_RPC_HOST)
    .requiredOption('-p, --program-id [string]', 'program id', DEFAULT_PROGRAM_ID)

cli
    .command('show-idl')
    .description('show IDL')
    .action(showIDL);

(async () => {
    await cli.parseAsync(process.argv)
})();