import { Injectable } from '@angular/core';
import { EmployeeNews } from '../models/employee-news.model';
import { NewsCategory, NewsStatus, ReactionType } from '../models/enums';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { MockAuthService } from './mock-auth.service';

export interface NewsFilter {
  search?: string;
  status?: NewsStatus | '';
  category?: NewsCategory | '';
}

@Injectable({ providedIn: 'root' })
export class EmployeeNewsService {
  private news: EmployeeNews[] = [];

  constructor(
    private readonly auth: MockAuthService
  ) {
    this.load();
  }

  getAll(filter?: NewsFilter): EmployeeNews[] {
    let result = [...this.news];
    if (filter?.search) {
      const term = filter.search.toLowerCase();
      result = result.filter(
        (n) => n.title.toLowerCase().includes(term) || n.content.toLowerCase().includes(term)
      );
    }
    if (filter?.status) {
      result = result.filter((n) => n.status === filter.status);
    }
    if (filter?.category) {
      result = result.filter((n) => n.category === filter.category);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getById(id: string): EmployeeNews | undefined {
    return this.news.find((n) => n.id === id);
  }

  getPublishedCount(): number {
    return this.news.filter((n) => n.status === NewsStatus.Published).length;
  }

  getLatestPublished(limit = 3): EmployeeNews[] {
    return this.news
      .filter((n) => n.status === NewsStatus.Published)
      .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime())
      .slice(0, limit);
  }

  create(item: Omit<EmployeeNews, 'id' | 'createdAt' | 'createdBy' | 'modifiedAt' | 'modifiedBy' | 'viewsCount' | 'reactions' | 'publishedAt'> & { publishedAt?: string | null }): EmployeeNews {
    const now = new Date().toISOString();
    const created: EmployeeNews = {
      ...item,
      id: `news-${Date.now()}`,
      publishedAt: item.publishedAt ?? null,
      createdAt: now,
      createdBy: this.auth.currentUser?.fullNameEn || 'System',
      modifiedAt: now,
      modifiedBy: this.auth.currentUser?.fullNameEn || 'System',
      viewsCount: 0,
      reactions: this.defaultReactions()
    };
    this.news.push(created);
    this.persist();
    return created;
  }

  update(id: string, data: Partial<EmployeeNews>): EmployeeNews | null {
    const index = this.news.findIndex((n) => n.id === id);
    if (index === -1) {
      return null;
    }
    const existing = this.news[index];
    this.news[index] = {
      ...existing,
      ...data,
      viewsCount: existing.viewsCount,
      reactions: existing.reactions,
      modifiedAt: new Date().toISOString(),
      modifiedBy: this.auth.currentUser?.fullNameEn || 'System'
    };
    this.persist();
    return this.news[index];
  }

  publish(id: string): EmployeeNews | null {
    const item = this.getById(id);
    if (!item) {
      return null;
    }
    item.status = NewsStatus.Published;
    item.publishedAt = new Date().toISOString();
    item.modifiedAt = new Date().toISOString();
    item.modifiedBy = this.auth.currentUser?.fullNameEn || 'System';
    this.persist();
    return item;
  }

  unpublish(id: string): EmployeeNews | null {
    const item = this.getById(id);
    if (!item) {
      return null;
    }
    item.status = NewsStatus.Unpublished;
    item.modifiedAt = new Date().toISOString();
    item.modifiedBy = this.auth.currentUser?.fullNameEn || 'System';
    this.persist();
    return item;
  }

  delete(id: string): boolean {
    const item = this.getById(id);
    if (!item) {
      return false;
    }
    this.news = this.news.filter((n) => n.id !== id);
    this.persist();
    return true;
  }

  private defaultReactions() {
    return [
      { type: ReactionType.Like, count: 12 },
      { type: ReactionType.Celebrate, count: 5 },
      { type: ReactionType.Support, count: 3 },
      { type: ReactionType.Sad, count: 0 },
      { type: ReactionType.Thanks, count: 2 }
    ];
  }

  private load(): void {
    const raw = localStorage.getItem(STORAGE_KEYS.EMPLOYEE_NEWS);
    this.news = raw ? JSON.parse(raw) : [];
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEE_NEWS, JSON.stringify(this.news));
  }

  static seedData(): EmployeeNews[] {
    const now = Date.now();
    return [
      {
        id: 'news-1',
        title: 'Team Achievement Update',
        content: 'The team completed a major project milestone successfully.',
        category: NewsCategory.AchievementsProjects,
        status: NewsStatus.Published,
        attachments: [],
        publishedAt: new Date(now - 86400000 * 2).toISOString(),
        createdAt: new Date(now - 86400000 * 3).toISOString(),
        createdBy: 'System Administrator',
        modifiedAt: new Date(now - 86400000 * 2).toISOString(),
        modifiedBy: 'System Administrator',
        viewsCount: 145,
        reactions: [
          { type: ReactionType.Like, count: 24 },
          { type: ReactionType.Celebrate, count: 18 },
          { type: ReactionType.Support, count: 6 },
          { type: ReactionType.Sad, count: 0 },
          { type: ReactionType.Thanks, count: 4 }
        ]
      },
      {
        id: 'news-2',
        title: 'Social Gathering Announcement',
        content: 'Join us for the upcoming social event next week.',
        category: NewsCategory.SocialEvents,
        status: NewsStatus.Published,
        attachments: [],
        publishedAt: new Date(now - 86400000 * 5).toISOString(),
        createdAt: new Date(now - 86400000 * 6).toISOString(),
        createdBy: 'System Administrator',
        modifiedAt: new Date(now - 86400000 * 5).toISOString(),
        modifiedBy: 'System Administrator',
        viewsCount: 89,
        reactions: [
          { type: ReactionType.Like, count: 15 },
          { type: ReactionType.Celebrate, count: 8 },
          { type: ReactionType.Support, count: 2 },
          { type: ReactionType.Sad, count: 0 },
          { type: ReactionType.Thanks, count: 1 }
        ]
      },
      {
        id: 'news-3',
        title: 'Congratulations to Top Performers',
        content: 'Recognizing outstanding contributions this quarter.',
        category: NewsCategory.CongratulationsHonoring,
        status: NewsStatus.Draft,
        attachments: [],
        publishedAt: null,
        createdAt: new Date(now - 86400000).toISOString(),
        createdBy: 'System Administrator',
        modifiedAt: new Date(now - 86400000).toISOString(),
        modifiedBy: 'System Administrator',
        viewsCount: 0,
        reactions: [
          { type: ReactionType.Like, count: 0 },
          { type: ReactionType.Celebrate, count: 0 },
          { type: ReactionType.Support, count: 0 },
          { type: ReactionType.Sad, count: 0 },
          { type: ReactionType.Thanks, count: 0 }
        ]
      },
      {
        id: 'news-4',
        title: 'General Policy Update',
        content: 'Updated guidelines for remote work arrangements.',
        category: NewsCategory.GeneralNews,
        status: NewsStatus.Unpublished,
        attachments: [],
        publishedAt: new Date(now - 86400000 * 10).toISOString(),
        createdAt: new Date(now - 86400000 * 12).toISOString(),
        createdBy: 'System Administrator',
        modifiedAt: new Date(now - 86400000 * 4).toISOString(),
        modifiedBy: 'System Administrator',
        viewsCount: 56,
        reactions: [
          { type: ReactionType.Like, count: 8 },
          { type: ReactionType.Celebrate, count: 0 },
          { type: ReactionType.Support, count: 3 },
          { type: ReactionType.Sad, count: 1 },
          { type: ReactionType.Thanks, count: 2 }
        ]
      },
      {
        id: 'news-5',
        title: 'Personal Milestone Celebration',
        content: 'Celebrating a team member personal achievement.',
        category: NewsCategory.PersonalEvents,
        status: NewsStatus.Published,
        attachments: [],
        publishedAt: new Date(now - 86400000 * 1).toISOString(),
        createdAt: new Date(now - 86400000 * 1).toISOString(),
        createdBy: 'System Administrator',
        modifiedAt: new Date(now - 86400000 * 1).toISOString(),
        modifiedBy: 'System Administrator',
        viewsCount: 34,
        reactions: [
          { type: ReactionType.Like, count: 10 },
          { type: ReactionType.Celebrate, count: 7 },
          { type: ReactionType.Support, count: 4 },
          { type: ReactionType.Sad, count: 0 },
          { type: ReactionType.Thanks, count: 3 }
        ]
      }
    ];
  }
}
