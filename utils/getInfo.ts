import { Commitment, Connection, PublicKey } from '@solana/web3.js';
import { getPdaMetadataKey } from '@raydium-io/raydium-sdk';
import { getMetadataAccountDataSerializer } from '@metaplex-foundation/mpl-token-metadata';
import axios from 'axios';


export const checkSocial = async (connection: Connection, baseMint: PublicKey, commitment: Commitment) => {
  try {
    const serializer = getMetadataAccountDataSerializer()
    const metadataPDA = getPdaMetadataKey(baseMint);
    const metadataAccount = await connection.getAccountInfo(metadataPDA.publicKey, commitment);
    if (!metadataAccount?.data) {
      return { ok: false, message: 'Mutable -> Failed to fetch account data' };
    }
    const deserialize = serializer.deserialize(metadataAccount.data);
    const metadata = deserialize[0];

    console.log("🚀 ~ checkSocial ~ metadata:", metadata);
    
    console.log("🚀 ~ checkSocial ~ metadata:", metadata.uri);
    return {
        ok: true,
        data: metadata
    };
    
  } catch (error) {
    console.log(":rocket: ~ checkSocial ~ error:", error);
    return {
        ok: false,
        message: "Fetching data error!"
    }
  }
}


export const fetchImage = async (uri: string) => {
  try {
    const response = await axios.get(uri, { timeout: 1000 }); // Adjust timeout based on typical response times
    return response.data.image;
  } catch (error: any) {
    console.log('Error fetching image:', error.message || error.code);
    return "https://image-optimizer.jpgstoreapis.com/37d60fa1-bca9-4082-868f-5e081600ea3b?width=600";
  }
}