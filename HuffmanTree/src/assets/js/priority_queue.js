export class PriorityQueue {
    constructor() {
        this.queue = [];
    }

    enqueue(item, priority) {
        const queueItem = {item, priority};
        for (let i = 0; i < this.queue.length; i++)
            if (item === this.queue[i].item)
                return false;
        let added = false;

        for (let i = 0; i < this.queue.length; i++) {
            if (queueItem.priority < this.queue[i].priority) {
                this.queue.splice(i, 0, queueItem);
                added = true;
                break;
            }
        }

        if (!added) {
            this.queue.push(queueItem);
        }
        return true;
    }

    dequeue(index) {
        if (this.isEmpty()) {
            return null;
        }
        this.queue.splice(index, 1);
    }

    isEmpty() {
        return this.queue.length === 0;
    }

    size() {
        return this.queue.length;
    }

    content() {
        return this.queue;
    }

    clear(){
        this.queue = []
    }
}
