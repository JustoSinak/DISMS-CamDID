const ethers = require('ethers');
const keccak256 = ethers.keccak256;

class MerkleTree {
  constructor(elements) {
    this.elements = elements.map(el => this.hashElement(el));
    this.layers = this.getLayers(this.elements);
  }

  getLayers(elements) {
    if (elements.length === 0) {
      return [['']];
    }

    const layers = [];
    layers.push(elements);

    // Get next layer until we reach the root
    while (layers[layers.length - 1].length > 1) {
      layers.push(this.getNextLayer(layers[layers.length - 1]));
    }

    return layers;
  }

  getNextLayer(elements) {
    return elements.reduce((layer, el, idx) => {
      if (idx % 2 === 0) {
        // Hash the current element with its pair
        layer.push(this.combinedHash(el, elements[idx + 1]));
      }
      return layer;
    }, []);
  }

  combinedHash(first, second) {
    if (!first) return second;
    if (!second) return first;

    return keccak256(
      Buffer.concat([
        Buffer.from(first.slice(2), 'hex'),
        Buffer.from(second.slice(2), 'hex')
      ])
    );
  }

  hashElement(element) {
    return keccak256(
      Buffer.from(
        typeof element === 'string' ? element : JSON.stringify(element)
      )
    );
  }

  getRoot() {
    return this.layers[this.layers.length - 1][0];
  }

  getProof(element) {
    const idx = this.elements.indexOf(this.hashElement(element));
    if (idx === -1) {
      throw new Error('Element not found in Merkle tree');
    }

    return this.layers.reduce((proof, layer) => {
      const pairIdx = idx % 2 === 0 ? idx + 1 : idx - 1;
      if (pairIdx < layer.length) {
        proof.push(layer[pairIdx]);
      }
      idx = Math.floor(idx / 2);
      return proof;
    }, []);
  }

  verify(proof, root, element) {
    let computedHash = this.hashElement(element);

    for (let i = 0; i < proof.length; i++) {
      const proofElement = proof[i];
      computedHash = computedHash < proofElement
        ? this.combinedHash(computedHash, proofElement)
        : this.combinedHash(proofElement, computedHash);
    }

    return computedHash === root;
  }
}

async function createMerkleTree(elements) {
  return new MerkleTree(elements);
}

module.exports = {
  createMerkleTree,
  MerkleTree
};
