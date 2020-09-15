# Generated by Django 2.2.7 on 2020-09-15 05:57

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Album',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('like', models.IntegerField()),
                ('img', models.URLField(null=True)),
                ('released_date', models.CharField(max_length=200)),
            ],
        ),
        migrations.CreateModel(
            name='Artist',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('debue', models.CharField(max_length=200)),
                ('img', models.URLField(null=True)),
                ('type', models.CharField(max_length=200)),
                ('member', models.CharField(max_length=200, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Genre',
            fields=[
                ('name', models.CharField(max_length=200, primary_key=True, serialize=False)),
                ('num', models.CharField(max_length=200, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Song',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('like', models.IntegerField()),
                ('img', models.URLField(null=True)),
                ('lyric', models.TextField(null=True)),
                ('released', models.CharField(max_length=200)),
                ('type', models.CharField(max_length=200, null=True)),
                ('album', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='album_songs', to='music.Album')),
                ('artist', models.ManyToManyField(related_name='artist_songs', to='music.Artist')),
                ('genre', models.ManyToManyField(related_name='song_genres', to='music.Genre')),
            ],
        ),
        migrations.AddField(
            model_name='album',
            name='artist',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='artist_albums', to='music.Artist'),
        ),
        migrations.AddField(
            model_name='album',
            name='genres',
            field=models.ManyToManyField(related_name='album_genres', to='music.Genre'),
        ),
    ]
